import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { SummaryCard } from '@/components/common/SummaryCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useBusinessBills } from '@/hooks/useBusinessBills';
import type { Transaction } from '@/types/expense';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

type TransactionForm = {
  date: string;
  particular: string;
  credit: string;
  debit: string;
  note: string;
};

const emptyTransactionForm: TransactionForm = {
  date: new Date().toISOString().split('T')[0],
  particular: '',
  credit: '0',
  debit: '0',
  note: '',
};

function billStatus(balance: number, totalDebit: number) {
  if (balance === 0 && totalDebit > 0) return 'paid' as const;
  if (totalDebit > 0) return 'completed' as const;
  return 'pending' as const;
}

export default function BillDetail() {
  const navigate = useNavigate();
  const { companyId, billId } = useParams<{ companyId: string; billId: string }>();
  const decodedCompanyId = decodeURIComponent(companyId || '');
  const decodedBillId = decodeURIComponent(billId || '');

  const {
    getCompanyById,
    getBillById,
    handleAddTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleUpdateBill,
  } = useBusinessBills();

  const company = getCompanyById(decodedCompanyId);
  const bill = getBillById(decodedCompanyId, decodedBillId);

  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionForm, setTransactionForm] = useState<TransactionForm>(emptyTransactionForm);

  const [billEditOpen, setBillEditOpen] = useState(false);
  const [billForm, setBillForm] = useState({
    billNo: bill?.billNumber || '',
    billName: bill?.billName || '',
    billAmount: bill ? String(bill.totalAmount) : '',
    dateCreated: bill?.createdDate || new Date().toISOString().split('T')[0],
  });

  const sortedTransactions = useMemo(() => {
    if (!bill) return [];
    return [...bill.transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [bill]);

  if (!company || !bill) {
    return (
      <PageLayout>
        <div className="space-y-4">
          <Button variant="outline" onClick={() => navigate('/business')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Business
          </Button>
          <Card className="p-6 text-center text-muted-foreground">Bill not found.</Card>
        </div>
      </PageLayout>
    );
  }

  const status = billStatus(bill.balance, bill.totalDebit);

  const openAddTransaction = () => {
    setEditingTransaction(null);
    setTransactionForm(emptyTransactionForm);
    setTransactionDialogOpen(true);
  };

  const openEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionForm({
      date: transaction.date,
      particular: transaction.particular,
      credit: String(transaction.credit),
      debit: String(transaction.debit),
      note: transaction.note || '',
    });
    setTransactionDialogOpen(true);
  };

  const saveTransaction = () => {
    const credit = Number(transactionForm.credit || 0);
    const debit = Number(transactionForm.debit || 0);

    if (!transactionForm.particular.trim()) {
      toast({ title: 'Particular is required', variant: 'destructive' });
      return;
    }

    if (!Number.isFinite(credit) || !Number.isFinite(debit) || credit < 0 || debit < 0) {
      toast({ title: 'Invalid amount', description: 'Credit and Debit must be valid numbers.', variant: 'destructive' });
      return;
    }

    if (debit === 0 && credit === 0) {
      toast({ title: 'Invalid transaction', description: 'Provide credit or debit value.', variant: 'destructive' });
      return;
    }

    if (editingTransaction) {
      handleUpdateTransaction(company.id, bill.id, editingTransaction.id, {
        date: transactionForm.date,
        particular: transactionForm.particular.trim(),
        credit,
        debit,
        note: transactionForm.note.trim() || undefined,
      });
      toast({ title: 'Transaction updated' });
    } else {
      handleAddTransaction(company.id, bill.id, {
        date: transactionForm.date,
        particular: transactionForm.particular.trim(),
        credit,
        debit,
        note: transactionForm.note.trim() || undefined,
      });
      toast({ title: 'Transaction added' });
    }

    setTransactionDialogOpen(false);
    setEditingTransaction(null);
    setTransactionForm(emptyTransactionForm);
  };

  const deleteTransaction = (transactionId: string) => {
    const confirmed = window.confirm('Delete this transaction?');
    if (!confirmed) return;
    handleDeleteTransaction(company.id, bill.id, transactionId);
    toast({ title: 'Transaction deleted' });
  };

  const saveBill = () => {
    const amount = Number(billForm.billAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({ title: 'Invalid bill amount', variant: 'destructive' });
      return;
    }

    handleUpdateBill(company.id, bill.id, {
      billNo: billForm.billNo.trim(),
      billName: billForm.billName.trim() || billForm.billNo.trim(),
      billAmount: amount,
      dateCreated: billForm.dateCreated,
    });

    setBillEditOpen(false);
    toast({ title: 'Bill updated' });
  };

  return (
    <PageLayout>
      <div className="space-y-6 pb-24 md:pb-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Button
              variant="ghost"
              className="mb-2 -ml-3"
              onClick={() => navigate(`/business/company/${encodeURIComponent(company.id)}`)}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Bills
            </Button>
            <h1 className="text-2xl font-bold text-foreground">{bill.billName}</h1>
            <p className="text-sm text-muted-foreground">
              {company.companyName} • {bill.billNumber}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setBillForm({
                  billNo: bill.billNumber,
                  billName: bill.billName,
                  billAmount: String(bill.totalAmount),
                  dateCreated: bill.createdDate,
                });
                setBillEditOpen(true);
              }}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard title="Bill Number" value={bill.billNumber} subtitle="Identifier" icon={<Plus className="w-5 h-5 text-primary" />} />
          <SummaryCard title="Total Amount" value={`₹${bill.totalAmount.toLocaleString()}`} subtitle="Credit" icon={<Plus className="w-5 h-5 text-primary" />} />
          <SummaryCard title="Paid Amount" value={`₹${bill.totalDebit.toLocaleString()}`} subtitle="Debit" icon={<Plus className="w-5 h-5 text-primary" />} />
          <SummaryCard title="Balance" value={`₹${bill.balance.toLocaleString()}`} subtitle="Outstanding" icon={<Plus className="w-5 h-5 text-destructive" />} />
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Transactions</h2>
            <p className="text-sm text-muted-foreground">Date, Particular, Credit, Debit</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-accent/30">
                  <TableHead>Date</TableHead>
                  <TableHead>Particular</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{transaction.particular}</p>
                        {transaction.note && (
                          <p className="text-xs text-muted-foreground">{transaction.note}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.credit > 0 ? `₹${transaction.credit.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.debit > 0 ? `₹${transaction.debit.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => openEditTransaction(transaction)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteTransaction(transaction.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No transactions yet. Use Add Transaction to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Button
          className="fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full shadow-lg md:bottom-6 md:right-6"
          aria-label="Add Transaction"
          onClick={openAddTransaction}
        >
          <Plus className="w-5 h-5" />
          <span className="sr-only">Add Transaction</span>
        </Button>

        <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="txn-date">Date</Label>
                <Input
                  id="txn-date"
                  type="date"
                  value={transactionForm.date}
                  onChange={(e) => setTransactionForm((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="txn-particular">Particular</Label>
                <Input
                  id="txn-particular"
                  value={transactionForm.particular}
                  onChange={(e) => setTransactionForm((prev) => ({ ...prev, particular: e.target.value }))}
                  placeholder="Payment Received"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="txn-credit">Credit</Label>
                  <Input
                    id="txn-credit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={transactionForm.credit}
                    onChange={(e) => setTransactionForm((prev) => ({ ...prev, credit: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="txn-debit">Debit</Label>
                  <Input
                    id="txn-debit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={transactionForm.debit}
                    onChange={(e) => setTransactionForm((prev) => ({ ...prev, debit: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="txn-note">Note</Label>
                <Input
                  id="txn-note"
                  value={transactionForm.note}
                  onChange={(e) => setTransactionForm((prev) => ({ ...prev, note: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setTransactionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={saveTransaction}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={billEditOpen} onOpenChange={setBillEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Bill</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="bill-number">Bill Number</Label>
                <Input
                  id="bill-number"
                  value={billForm.billNo}
                  onChange={(e) => setBillForm((prev) => ({ ...prev, billNo: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bill-name">Bill Name</Label>
                <Input
                  id="bill-name"
                  value={billForm.billName}
                  onChange={(e) => setBillForm((prev) => ({ ...prev, billName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bill-amount">Total Amount</Label>
                <Input
                  id="bill-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={billForm.billAmount}
                  onChange={(e) => setBillForm((prev) => ({ ...prev, billAmount: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bill-date">Created Date</Label>
                <Input
                  id="bill-date"
                  type="date"
                  value={billForm.dateCreated}
                  onChange={(e) => setBillForm((prev) => ({ ...prev, dateCreated: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setBillEditOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={saveBill}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
