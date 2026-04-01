import { createId } from '@/lib/id';
import type { Company } from '@/types/company';
import type { Bill, Payment, Transaction } from '@/types/expense';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function normalized(value: string) {
  return value.trim().toLowerCase();
}

function safeDate(value?: string) {
  if (!value) return todayISO();
  const candidate = new Date(value);
  if (Number.isNaN(candidate.getTime())) return todayISO();
  return candidate.toISOString().split('T')[0];
}

function dueDateFrom(createdDate: string) {
  const created = new Date(createdDate);
  const due = new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000);
  return due.toISOString().split('T')[0];
}

export function transactionFromPayment(payment: Payment, billId: string): Transaction {
  return {
    id: payment.id || createId(),
    billId,
    date: safeDate(payment.date),
    particular: payment.note || 'Payment Received',
    credit: 0,
    debit: Number(payment.amount) || 0,
    note: payment.note,
  };
}

function normalizeTransaction(txn: Partial<Transaction>, billId: string): Transaction {
  const credit = Number(txn.credit) || 0;
  const debit = Number(txn.debit) || 0;
  const note = txn.note || undefined;

  return {
    id: txn.id || createId(),
    billId,
    date: safeDate(txn.date),
    particular: txn.particular || note || (debit > 0 ? 'Payment Received' : 'Ledger Entry'),
    credit,
    debit,
    note,
  };
}

export function toLegacyPayments(transactions: Transaction[]): Payment[] {
  return transactions
    .filter((txn) => txn.debit > 0)
    .map((txn) => ({
      id: txn.id,
      amount: txn.debit,
      date: txn.date,
      note: txn.note || txn.particular,
    }));
}

export function recalculateBill(raw: Partial<Bill> & { id: string; companyId: string }, companyName?: string): Bill {
  const billNumber = (raw.billNumber || raw.billNo || '').trim() || `BILL-${raw.id.slice(0, 6).toUpperCase()}`;
  const billName = (raw.billName || raw.name || billNumber).trim();
  const totalAmount = Number(raw.totalAmount ?? raw.billAmount ?? raw.totalCredit ?? 0) || 0;
  const createdDate = safeDate(raw.createdDate || raw.dateCreated);
  const dueDate = safeDate(raw.dueDate || dueDateFrom(createdDate));

  const transactionsSeed = Array.isArray(raw.transactions)
    ? raw.transactions
    : Array.isArray(raw.payments)
      ? raw.payments.map((payment) => transactionFromPayment(payment, raw.id))
      : [];

  const transactions = transactionsSeed.map((txn) => normalizeTransaction(txn, raw.id));

  const totalDebit = transactions.reduce((sum, txn) => sum + txn.debit, 0);
  const inferredPaid = Number(raw.paid ?? 0) || 0;

  if (transactions.length === 0 && inferredPaid > 0) {
    transactions.push(
      normalizeTransaction(
        {
          id: createId(),
          date: createdDate,
          particular: 'Migrated Payment',
          debit: inferredPaid,
          credit: 0,
          note: 'Migrated Payment',
        },
        raw.id,
      ),
    );
  }

  const nextTotalDebit = transactions.reduce((sum, txn) => sum + txn.debit, 0);
  const balance = Math.max(0, totalAmount - nextTotalDebit);
  const status = balance === 0 ? 'paid' : nextTotalDebit > 0 ? 'completed' : 'pending';
  const legacyName = companyName || raw.name || billName;

  return {
    id: raw.id,
    companyId: raw.companyId,
    billName,
    billNumber,
    totalAmount,
    totalCredit: totalAmount,
    totalDebit: nextTotalDebit,
    balance,
    status,
    createdDate,
    dueDate,
    transactions,

    // Legacy aliases
    billNo: billNumber,
    name: legacyName,
    billAmount: totalAmount,
    paid: nextTotalDebit,
    dateCreated: createdDate,
    payments: toLegacyPayments(transactions),
  };
}

export function recalculateCompany(raw: Partial<Company> & { id: string }): Company {
  const now = new Date().toISOString();
  const companyName = (raw.companyName || raw.name || 'Unknown Company').trim() || 'Unknown Company';

  const bills = (Array.isArray(raw.bills) ? raw.bills : [])
    .map((bill) => recalculateBill({ ...bill, companyId: raw.id }, companyName))
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

  const totalCredit = bills.reduce((sum, bill) => sum + bill.totalCredit, 0);
  const totalDebit = bills.reduce((sum, bill) => sum + bill.totalDebit, 0);
  const balance = bills.reduce((sum, bill) => sum + bill.balance, 0);

  return {
    id: raw.id,
    name: companyName,
    companyName,
    ownerName: raw.ownerName || '',
    gstn: raw.gstn || '',
    address: raw.address || '',
    phoneNumber: raw.phoneNumber || '',
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || now,
    totalCredit,
    totalDebit,
    balance,
    bills,
  };
}

export function hasHierarchicalBillingSchema(companies: Company[]) {
  return companies.some((company) => Array.isArray(company.bills));
}

export function migrateToHierarchicalCompanies(rawCompanies: Company[], rawBills: Bill[]): Company[] {
  const rawHasNestedBills = (rawCompanies || []).some(
    (company) => Array.isArray((company as Partial<Company>).bills) && ((company as Partial<Company>).bills?.length || 0) > 0,
  );

  const baseCompanies = (rawCompanies || []).map((company) =>
    recalculateCompany({
      ...company,
      bills: Array.isArray(company.bills) ? company.bills : [],
    }),
  );

  if (rawHasNestedBills) {
    return baseCompanies.map((company) => recalculateCompany(company));
  }

  const byId = new Map(baseCompanies.map((company) => [company.id, { ...company, bills: [] as Bill[] }]));

  for (const rawBill of rawBills || []) {
    const byCompanyId = rawBill.companyId ? byId.get(rawBill.companyId) : undefined;
    const byCompanyName =
      !byCompanyId && rawBill.name
        ? Array.from(byId.values()).find((company) => normalized(company.companyName) === normalized(rawBill.name || ''))
        : undefined;

    let targetCompany = byCompanyId || byCompanyName;

    if (!targetCompany) {
      const nameFromBill = (rawBill.name || 'Unknown Company').trim() || 'Unknown Company';
      const companyId = rawBill.companyId || createId();
      targetCompany = recalculateCompany({
        id: companyId,
        name: nameFromBill,
        companyName: nameFromBill,
        ownerName: '',
        gstn: '',
        address: '',
        phoneNumber: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bills: [],
      });
      byId.set(targetCompany.id, { ...targetCompany, bills: [] });
      targetCompany = byId.get(targetCompany.id)!;
    }

    const normalizedBill = recalculateBill(
      {
        ...rawBill,
        companyId: targetCompany.id,
      },
      targetCompany.companyName,
    );

    targetCompany.bills.push(normalizedBill);
  }

  return Array.from(byId.values())
    .map((company) => recalculateCompany(company))
    .sort((a, b) => a.companyName.localeCompare(b.companyName));
}

export function flattenBillsFromCompanies(companies: Company[]): Bill[] {
  return companies.flatMap((company) =>
    company.bills.map((bill) =>
      recalculateBill(
        {
          ...bill,
          companyId: company.id,
        },
        company.companyName,
      ),
    ),
  );
}
