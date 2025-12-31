import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { BillTable } from '@/components/business/BillTable';
import { AddBillModal } from '@/components/business/AddBillModal';
import { SummaryCard } from '@/components/common/SummaryCard';
import { ExportButtons } from '@/components/common/ExportButtons';
import { mockBills } from '@/data/mockData';
import { Bill } from '@/types/expense';
import { Receipt, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

export default function Business() {
  const [bills, setBills] = useState<Bill[]>(mockBills);

  const handleAddBill = (billData: {
    billNo: string;
    name: string;
    billAmount: number;
    dateCreated: string;
  }) => {
    const newBill: Bill = {
      id: Date.now().toString(),
      ...billData,
      paid: 0,
      balance: billData.billAmount,
      status: 'pending',
      payments: [],
    };
    setBills([newBill, ...bills]);
  };

  const handleAddPayment = (billId: string, amount: number, note?: string) => {
    setBills(bills.map(bill => {
      if (bill.id === billId) {
        const newPaid = bill.paid + amount;
        const newBalance = bill.billAmount - newPaid;
        return {
          ...bill,
          paid: newPaid,
          balance: newBalance,
          status: newBalance === 0 ? 'completed' : 'pending',
          payments: [
            ...bill.payments,
            {
              id: Date.now().toString(),
              amount,
              date: new Date().toISOString().split('T')[0],
              note,
            },
          ],
        };
      }
      return bill;
    }));
  };

  const totalBills = bills.reduce((sum, bill) => sum + bill.billAmount, 0);
  const totalPaid = bills.reduce((sum, bill) => sum + bill.paid, 0);
  const totalBalance = bills.reduce((sum, bill) => sum + bill.balance, 0);
  const completedCount = bills.filter(bill => bill.status === 'completed').length;
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
            value={`$${totalBills.toLocaleString()}`}
            icon={<Receipt className="w-5 h-5 text-primary" />}
            subtitle={`${bills.length} bills`}
          />
          <SummaryCard
            title="Total Paid"
            value={`$${totalPaid.toLocaleString()}`}
            icon={<DollarSign className="w-5 h-5 text-primary" />}
            subtitle={`${completedCount} completed`}
          />
          <SummaryCard
            title="Outstanding"
            value={`$${totalBalance.toLocaleString()}`}
            icon={<AlertCircle className="w-5 h-5 text-destructive" />}
            subtitle={`${pendingCount} pending`}
          />
          <SummaryCard
            title="Completion Rate"
            value={`${bills.length ? Math.round((completedCount / bills.length) * 100) : 0}%`}
            icon={<CheckCircle className="w-5 h-5 text-primary" />}
            subtitle="Bills completed"
          />
        </div>

        {/* Bills Table */}
        <BillTable bills={bills} onAddPayment={handleAddPayment} />
      </div>
    </PageLayout>
  );
}
