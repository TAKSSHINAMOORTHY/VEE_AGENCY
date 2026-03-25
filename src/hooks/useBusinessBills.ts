import { useEffect, useMemo, useState } from 'react';
import { Bill } from '@/types/expense';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import { createId } from '@/lib/id';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';

export function normalizeBill(bill: Bill): Bill {
  const paid = bill.paid;
  const balance = Math.max(0, bill.billAmount - paid);

  let dueDate = bill.dueDate;
  if (!dueDate) {
    const dateCreated = new Date(bill.dateCreated);
    const dueDateObj = new Date(dateCreated.getTime() + 30 * 24 * 60 * 60 * 1000);
    dueDate = dueDateObj.toISOString().split('T')[0];
  }

  return {
    ...bill,
    dueDate,
    balance,
    status: balance === 0 ? 'paid' : 'pending',
  };
}

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

export function useBusinessBills() {
  const [bills, setBills] = useLocalStorageState<Bill[]>(STORAGE_KEYS.bills, []);
  const [openBillId, setOpenBillId] = useState<string | null>(null);

  const normalizedBills = useMemo(() => bills.map(normalizeBill), [bills]);

  useEffect(() => {
    const needsUpdate = bills.some((bill, index) => {
      const normalized = normalizedBills[index];
      return bill.status !== normalized.status || bill.balance !== normalized.balance;
    });

    if (needsUpdate) {
      setBills(normalizedBills);
    }
  }, [bills, normalizedBills, setBills]);

  const handleAddBill = (billData: AddBillInput) => {
    const dateCreated = new Date(billData.dateCreated);
    const dueDate = new Date(dateCreated.getTime() + 30 * 24 * 60 * 60 * 1000);
    const dueDateString = dueDate.toISOString().split('T')[0];

    const newBill: Bill = {
      id: createId(),
      billNo: billData.billNo,
      name: billData.name,
      companyId: billData.companyId,
      billAmount: billData.billAmount,
      dueDate: dueDateString,
      paid: 0,
      balance: billData.billAmount,
      status: 'pending',
      dateCreated: billData.dateCreated,
      payments: [],
    };

    setBills((prev) => [newBill, ...prev]);
    setOpenBillId(newBill.id);
  };

  const handleAddPayment = (billId: string, amount: number, date: string, note?: string) => {
    setBills((prev) =>
      prev.map((bill) => {
        if (bill.id !== billId) return bill;

        const updated: Bill = {
          ...bill,
          paid: bill.paid + amount,
          payments: [
            ...bill.payments,
            {
              id: createId(),
              amount,
              date,
              note,
            },
          ],
        };

        return normalizeBill(updated);
      }),
    );
  };

  const handleUpdatePayment = (
    billId: string,
    paymentId: string,
    updates: { amount: number; date: string; note?: string },
  ) => {
    setBills((prev) =>
      prev.map((bill) => {
        if (bill.id !== billId) return bill;

        const nextPayments = bill.payments.map((payment) =>
          payment.id === paymentId
            ? { ...payment, amount: updates.amount, date: updates.date, note: updates.note }
            : payment,
        );

        const nextPaid = nextPayments.reduce((sum, payment) => sum + payment.amount, 0);

        return normalizeBill({
          ...bill,
          payments: nextPayments,
          paid: nextPaid,
        });
      }),
    );
  };

  const handleDeletePayment = (billId: string, paymentId: string) => {
    setBills((prev) =>
      prev.map((bill) => {
        if (bill.id !== billId) return bill;

        const nextPayments = bill.payments.filter((payment) => payment.id !== paymentId);
        const nextPaid = nextPayments.reduce((sum, payment) => sum + payment.amount, 0);

        return normalizeBill({
          ...bill,
          payments: nextPayments,
          paid: nextPaid,
        });
      }),
    );
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
    const directBill: Bill = normalizeBill({
      id: directBillId,
      billNo: `DIRECT-${billNoSuffix}`,
      name: companyName,
      companyId,
      billAmount: amount,
      paid: amount,
      balance: 0,
      status: 'paid',
      dateCreated: today,
      dueDate: today,
      payments: [
        {
          id: createId(),
          amount,
          date: today,
          note: note || 'Direct Entry',
        },
      ],
    });

    setBills((prev) => [directBill, ...prev]);
    setOpenBillId(directBill.id);
  };

  const totalBills = bills.reduce((sum, bill) => sum + bill.billAmount, 0);
  const totalPaid = bills.reduce((sum, bill) => sum + bill.paid, 0);
  const totalBalance = bills.reduce((sum, bill) => sum + bill.balance, 0);
  const paidCount = bills.filter((bill) => bill.status !== 'pending').length;
  const pendingCount = bills.filter((bill) => bill.status === 'pending').length;

  return {
    bills: normalizedBills,
    openBillId,
    setOpenBillId,
    handleAddBill,
    handleAddPayment,
    handleUpdatePayment,
    handleDeletePayment,
    handleAddCompanyTransaction,
    totals: {
      totalBills,
      totalPaid,
      totalBalance,
      paidCount,
      pendingCount,
    },
  };
}
