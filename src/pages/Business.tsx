import { useEffect, useMemo, useState } from 'react';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { PageLayout } from '@/components/layout/PageLayout';
import { BillTable } from '@/components/business/BillTable';
import { AddBillModal } from '@/components/business/AddBillModal';
import { SummaryCard } from '@/components/common/SummaryCard';
import { ExportButtons } from '@/components/common/ExportButtons';
import { Bill } from '@/types/expense';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import { createId } from '@/lib/id';
import { Receipt, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

function normalizeBill(bill: Bill): Bill {
  const paid = bill.paid;
  const balance = Math.max(0, bill.billAmount - paid);
  
  // Add dueDate if it doesn't exist
  let dueDate = bill.dueDate;
  if (!dueDate) {
    const dateCreated = new Date(bill.dateCreated);
    // Add 30 days correctly by adding milliseconds
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

export default function Business() {
  const [bills, setBills] = useLocalStorageState<Bill[]>(STORAGE_KEYS.bills, []);
  const [openBillId, setOpenBillId] = useState<string | null>(null);

  const normalizedBills = useMemo(() => bills.map(normalizeBill), [bills]);

  useEffect(() => {
    // Migrate any legacy statuses/balances from storage.
    const needsUpdate = bills.some((bill, index) => {
      const normalized = normalizedBills[index];
      return (
        bill.status !== normalized.status ||
        bill.balance !== normalized.balance
      );
    });

    if (needsUpdate) {
      setBills(normalizedBills);
    }
  }, [bills, normalizedBills, setBills]);

  const handleAddBill = (billData: {
    billNo: string;
    billAmount: number;
    dateCreated: string;
  }) => {
    // Calculate due date as 30 days from date created
    const dateCreated = new Date(billData.dateCreated);
    // Add 30 days correctly by adding milliseconds
    const dueDate = new Date(dateCreated.getTime() + 30 * 24 * 60 * 60 * 1000);
    const dueDateString = dueDate.toISOString().split('T')[0];

    const newBill: Bill = {
      id: createId(),
      ...billData,
      dueDate: dueDateString,
      paid: 0,
      balance: billData.billAmount,
      status: 'pending',
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

  const handleUpdateBill = (billId: string, updates: { billAmount: number; paidAmount?: number }) => {
    setBills((prev) =>
      prev.map((bill) => {
        if (bill.id !== billId) return bill;

        const nextPaid = updates.paidAmount ?? bill.paid;
        const today = new Date().toISOString().split('T')[0];

        const updated: Bill = {
          ...bill,
          billAmount: updates.billAmount,
          paid: nextPaid,
          payments:
            updates.paidAmount === undefined
              ? bill.payments
              : nextPaid === 0
                ? []
                : [
                    {
                      id: createId(),
                      amount: nextPaid,
                      date: today,
                      note: 'Paid amount set',
                    },
                  ],
        };

        return normalizeBill(updated);
      }),
    );
  };

  const totalBills = bills.reduce((sum, bill) => sum + bill.billAmount, 0);
  const totalPaid = bills.reduce((sum, bill) => sum + bill.paid, 0);
  const totalBalance = bills.reduce((sum, bill) => sum + bill.balance, 0);
  const paidCount = bills.filter((bill) => bill.status !== 'pending').length;
  const pendingCount = bills.filter(bill => bill.status === 'pending').length;

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Business Bills</h1>
            <p className="text-muted-foreground">Track and manage your business expenses</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ExportButtons />
            <AddBillModal onAddBill={handleAddBill} />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Bills"
            value={`₹${totalBills.toLocaleString()}`}
            icon={<Receipt className="w-5 h-5 text-primary" />}
            subtitle={`${bills.length} bills`}
          />
          <SummaryCard
            title="Total Paid"
            value={`₹${totalPaid.toLocaleString()}`}
            icon={<DollarSign className="w-5 h-5 text-primary" />}
            subtitle={`${paidCount} paid`}
          />
          <SummaryCard
            title="Outstanding"
            value={`₹${totalBalance.toLocaleString()}`}
            icon={<AlertCircle className="w-5 h-5 text-destructive" />}
            subtitle={`${pendingCount} pending`}
          />
          <SummaryCard
            title="Completion Rate"
            value={`${bills.length ? Math.round((paidCount / bills.length) * 100) : 0}%`}
            icon={<CheckCircle className="w-5 h-5 text-primary" />}
            subtitle="Bills paid"
          />
        </div>

        {/* Bills Table */}
        <BillTable
          bills={normalizedBills}
          onAddPayment={handleAddPayment}
          onUpdatePayment={handleUpdatePayment}
          onDeletePayment={handleDeletePayment}
          openBillId={openBillId}
          onOpenBillHandled={() => setOpenBillId(null)}
        />
      </div>
    </PageLayout>
  );
}
