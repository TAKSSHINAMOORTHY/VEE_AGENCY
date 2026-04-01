import { useEffect, useMemo, useState } from 'react';
import type { Company } from '@/types/company';
import type { Bill, Transaction } from '@/types/expense';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import { createId } from '@/lib/id';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import {
  flattenBillsFromCompanies,
  migrateToHierarchicalCompanies,
  recalculateBill,
  recalculateCompany,
} from '@/lib/hierarchicalBilling';

type AddBillInput = {
  billNo: string;
  name: string;
  companyId?: string;
  billAmount: number;
  dateCreated: string;
};

type DirectTransactionInput = {
  companyId?: string;
  companyName: string;
  billId?: string;
  amount: number;
  date: string;
  note?: string;
};

type UpdateBillInput = {
  billNo?: string;
  billName?: string;
  billAmount?: number;
  dateCreated?: string;
};

type AddTransactionInput = {
  date: string;
  particular: string;
  credit: number;
  debit: number;
  note?: string;
};

type UpdateTransactionInput = Partial<AddTransactionInput>;

type BillLocation = {
  companyId: string;
  billId: string;
};

function normalizeCompanies(companies: Company[]) {
  return companies.map((company) => recalculateCompany(company));
}

function findBillLocation(companies: Company[], billId: string): BillLocation | null {
  for (const company of companies) {
    if (company.bills.some((bill) => bill.id === billId)) {
      return { companyId: company.id, billId };
    }
  }
  return null;
}

function resolveCompanyByName(companies: Company[], name: string) {
  const normalizedName = name.trim().toLowerCase();
  return companies.find((company) => company.companyName.trim().toLowerCase() === normalizedName);
}

function dueDateFrom(createdDate: string) {
  const created = new Date(createdDate);
  const due = new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000);
  return due.toISOString().split('T')[0];
}

export function useBusinessBills() {
  const [legacyBills, setLegacyBills] = useLocalStorageState<Bill[]>(STORAGE_KEYS.bills, []);
  const [companies, setCompanies] = useLocalStorageState<Company[]>(STORAGE_KEYS.companies, []);
  const [openBillId, setOpenBillId] = useState<string | null>(null);

  useEffect(() => {
    const migratedCompanies = migrateToHierarchicalCompanies(companies, legacyBills);
    if (JSON.stringify(migratedCompanies) !== JSON.stringify(companies)) {
      setCompanies(migratedCompanies);
      return;
    }

    const flattenedBills = flattenBillsFromCompanies(migratedCompanies);
    if (JSON.stringify(flattenedBills) !== JSON.stringify(legacyBills)) {
      setLegacyBills(flattenedBills);
    }

    if (typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEYS.billingSchemaVersion) !== '2') {
      window.localStorage.setItem(STORAGE_KEYS.billingSchemaVersion, '2');
    }
  }, [companies, legacyBills, setCompanies, setLegacyBills]);

  const normalizedCompanies = useMemo(() => normalizeCompanies(companies), [companies]);
  const bills = useMemo(() => flattenBillsFromCompanies(normalizedCompanies), [normalizedCompanies]);

  const commitCompanies = (nextCompanies: Company[]) => {
    setCompanies(normalizeCompanies(nextCompanies));
  };

  const handleAddBill = (billData: AddBillInput) => {
    const billId = createId();

    setCompanies((prev) => {
      const normalizedPrev = normalizeCompanies(prev);
      const targetById = billData.companyId
        ? normalizedPrev.find((company) => company.id === billData.companyId)
        : undefined;
      const targetByName = resolveCompanyByName(normalizedPrev, billData.name);

      let targetCompany = targetById ?? targetByName;
      const nextCompanies = [...normalizedPrev];

      if (!targetCompany) {
        const now = new Date().toISOString();
        targetCompany = recalculateCompany({
          id: billData.companyId || createId(),
          name: billData.name,
          companyName: billData.name,
          ownerName: '',
          gstn: '',
          address: '',
          phoneNumber: '',
          createdAt: now,
          updatedAt: now,
          totalCredit: 0,
          totalDebit: 0,
          balance: 0,
          bills: [],
        });
        nextCompanies.unshift(targetCompany);
      }

      const bill = recalculateBill(
        {
          id: billId,
          companyId: targetCompany.id,
          billName: billData.billNo,
          billNumber: billData.billNo,
          totalAmount: billData.billAmount,
          createdDate: billData.dateCreated,
          dueDate: dueDateFrom(billData.dateCreated),
          transactions: [],
          billNo: billData.billNo,
          name: targetCompany.companyName,
          billAmount: billData.billAmount,
          paid: 0,
          dateCreated: billData.dateCreated,
          payments: [],
        },
        targetCompany.companyName,
      );

      return normalizeCompanies(
        nextCompanies.map((company) =>
          company.id === targetCompany.id
            ? {
                ...company,
                updatedAt: new Date().toISOString(),
                bills: [bill, ...company.bills],
              }
            : company,
        ),
      );
    });

    setOpenBillId(billId);
  };

  const handleUpdateBill = (companyId: string, billId: string, updates: UpdateBillInput) => {
    commitCompanies(
      normalizedCompanies.map((company) => {
        if (company.id !== companyId) return company;

        return {
          ...company,
          updatedAt: new Date().toISOString(),
          bills: company.bills.map((bill) =>
            bill.id === billId
              ? recalculateBill(
                  {
                    ...bill,
                    billName: updates.billName || updates.billNo || bill.billName,
                    billNumber: updates.billNo || bill.billNumber,
                    billNo: updates.billNo || bill.billNo,
                    totalAmount: updates.billAmount ?? bill.totalAmount,
                    billAmount: updates.billAmount ?? bill.billAmount,
                    createdDate: updates.dateCreated || bill.createdDate,
                    dateCreated: updates.dateCreated || bill.dateCreated,
                  },
                  company.companyName,
                )
              : bill,
          ),
        };
      }),
    );
  };

  const handleDeleteBill = (companyId: string, billId: string) => {
    commitCompanies(
      normalizedCompanies.map((company) => {
        if (company.id !== companyId) return company;
        return {
          ...company,
          updatedAt: new Date().toISOString(),
          bills: company.bills.filter((bill) => bill.id !== billId),
        };
      }),
    );
  };

  const handleAddTransaction = (companyId: string, billId: string, input: AddTransactionInput) => {
    const transaction: Transaction = {
      id: createId(),
      billId,
      date: input.date,
      particular: input.particular,
      credit: Number(input.credit) || 0,
      debit: Number(input.debit) || 0,
      note: input.note,
    };

    commitCompanies(
      normalizedCompanies.map((company) => {
        if (company.id !== companyId) return company;

        return {
          ...company,
          updatedAt: new Date().toISOString(),
          bills: company.bills.map((bill) =>
            bill.id === billId
              ? recalculateBill(
                  {
                    ...bill,
                    transactions: [...bill.transactions, transaction],
                  },
                  company.companyName,
                )
              : bill,
          ),
        };
      }),
    );
  };

  const handleUpdateTransaction = (
    companyId: string,
    billId: string,
    transactionId: string,
    updates: UpdateTransactionInput,
  ) => {
    commitCompanies(
      normalizedCompanies.map((company) => {
        if (company.id !== companyId) return company;

        return {
          ...company,
          updatedAt: new Date().toISOString(),
          bills: company.bills.map((bill) =>
            bill.id === billId
              ? recalculateBill(
                  {
                    ...bill,
                    transactions: bill.transactions.map((transaction) =>
                      transaction.id === transactionId
                        ? {
                            ...transaction,
                            date: updates.date || transaction.date,
                            particular: updates.particular || transaction.particular,
                            credit: updates.credit ?? transaction.credit,
                            debit: updates.debit ?? transaction.debit,
                            note: updates.note ?? transaction.note,
                          }
                        : transaction,
                    ),
                  },
                  company.companyName,
                )
              : bill,
          ),
        };
      }),
    );
  };

  const handleDeleteTransaction = (companyId: string, billId: string, transactionId: string) => {
    commitCompanies(
      normalizedCompanies.map((company) => {
        if (company.id !== companyId) return company;

        return {
          ...company,
          updatedAt: new Date().toISOString(),
          bills: company.bills.map((bill) =>
            bill.id === billId
              ? recalculateBill(
                  {
                    ...bill,
                    transactions: bill.transactions.filter((transaction) => transaction.id !== transactionId),
                  },
                  company.companyName,
                )
              : bill,
          ),
        };
      }),
    );
  };

  const handleAddPayment = (billId: string, amount: number, date: string, note?: string) => {
    const location = findBillLocation(normalizedCompanies, billId);
    if (!location) return;

    handleAddTransaction(location.companyId, billId, {
      date,
      particular: note || 'Payment Received',
      credit: 0,
      debit: amount,
      note,
    });
  };

  const handleUpdatePayment = (
    billId: string,
    paymentId: string,
    updates: { amount: number; date: string; note?: string },
  ) => {
    const location = findBillLocation(normalizedCompanies, billId);
    if (!location) return;

    handleUpdateTransaction(location.companyId, billId, paymentId, {
      date: updates.date,
      particular: updates.note || 'Payment Updated',
      credit: 0,
      debit: updates.amount,
      note: updates.note,
    });
  };

  const handleDeletePayment = (billId: string, paymentId: string) => {
    const location = findBillLocation(normalizedCompanies, billId);
    if (!location) return;
    handleDeleteTransaction(location.companyId, billId, paymentId);
  };

  const handleAddCompanyTransaction = ({
    companyId,
    companyName,
    billId,
    amount,
    date,
    note,
  }: DirectTransactionInput) => {
    if (billId) {
      handleAddPayment(billId, amount, date, note);
      return;
    }

    const today = date || new Date().toISOString().split('T')[0];
    const directBillId = createId();
    const billNoSuffix = directBillId.slice(0, 6).toUpperCase();

    setCompanies((prev) => {
      const normalizedPrev = normalizeCompanies(prev);
      const targetById = companyId ? normalizedPrev.find((company) => company.id === companyId) : undefined;
      const targetByName = resolveCompanyByName(normalizedPrev, companyName);
      let targetCompany = targetById ?? targetByName;
      const nextCompanies = [...normalizedPrev];

      if (!targetCompany) {
        const now = new Date().toISOString();
        targetCompany = recalculateCompany({
          id: companyId || createId(),
          name: companyName,
          companyName,
          ownerName: '',
          gstn: '',
          address: '',
          phoneNumber: '',
          createdAt: now,
          updatedAt: now,
          totalCredit: 0,
          totalDebit: 0,
          balance: 0,
          bills: [],
        });
        nextCompanies.unshift(targetCompany);
      }

      const directBill = recalculateBill(
        {
          id: directBillId,
          companyId: targetCompany.id,
          billName: `DIRECT-${billNoSuffix}`,
          billNumber: `DIRECT-${billNoSuffix}`,
          totalAmount: amount,
          createdDate: today,
          dueDate: today,
          transactions: [
            {
              id: createId(),
              billId: directBillId,
              date: today,
              particular: note || 'Direct Entry',
              credit: 0,
              debit: amount,
              note: note || 'Direct Entry',
            },
          ],
          billNo: `DIRECT-${billNoSuffix}`,
          name: companyName,
          billAmount: amount,
          paid: amount,
          dateCreated: today,
          payments: [],
        },
        targetCompany.companyName,
      );

      return normalizeCompanies(
        nextCompanies.map((company) =>
          company.id === targetCompany.id
            ? {
                ...company,
                updatedAt: new Date().toISOString(),
                bills: [directBill, ...company.bills],
              }
            : company,
        ),
      );
    });

    setOpenBillId(directBillId);
  };

  const totalBills = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const totalPaid = bills.reduce((sum, bill) => sum + bill.totalDebit, 0);
  const totalBalance = bills.reduce((sum, bill) => sum + bill.balance, 0);
  const paidCount = bills.filter((bill) => bill.status !== 'pending').length;
  const pendingCount = bills.filter((bill) => bill.status === 'pending').length;

  const getCompanyById = (companyId: string) =>
    normalizedCompanies.find((company) => company.id === companyId) || null;

  const getBillById = (companyId: string, billId: string) => {
    const company = getCompanyById(companyId);
    if (!company) return null;
    return company.bills.find((bill) => bill.id === billId) || null;
  };

  const getCompanyByBillId = (billId: string) => {
    const location = findBillLocation(normalizedCompanies, billId);
    if (!location) return null;
    return getCompanyById(location.companyId);
  };

  return {
    companies: normalizedCompanies,
    bills,
    openBillId,
    setOpenBillId,
    handleAddBill,
    handleUpdateBill,
    handleDeleteBill,
    handleAddTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleAddPayment,
    handleUpdatePayment,
    handleDeletePayment,
    handleAddCompanyTransaction,
    getCompanyById,
    getBillById,
    getCompanyByBillId,
    totals: {
      totalBills,
      totalPaid,
      totalBalance,
      paidCount,
      pendingCount,
    },
  };
}
