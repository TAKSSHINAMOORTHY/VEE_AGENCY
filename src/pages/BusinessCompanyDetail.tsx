import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { SummaryCard } from '@/components/common/SummaryCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AddBillModal } from '@/components/business/AddBillModal';
import { useBusinessBills } from '@/hooks/useBusinessBills';
import type { Bill } from '@/types/expense';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

function billStatus(bill: Bill) {
  if (bill.balance === 0 && bill.totalDebit > 0) return 'paid' as const;
  if (bill.totalDebit > 0) return 'completed' as const;
  return 'pending' as const;
}

export default function BusinessCompanyDetail() {
  const navigate = useNavigate();
  const { companyId } = useParams<{ companyId: string }>();
  const decodedCompanyId = decodeURIComponent(companyId || '');

  const {
    getCompanyById,
    openBillId,
    setOpenBillId,
    handleAddBill,
    handleUpdateBill,
    handleDeleteBill,
  } = useBusinessBills();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'completed'>('all');
  const [expandedBillId, setExpandedBillId] = useState<string | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const [editForm, setEditForm] = useState({
    billNo: '',
    billName: '',
    billAmount: '',
    dateCreated: '',
  });

  const company = getCompanyById(decodedCompanyId);

  useEffect(() => {
    if (!openBillId || !company) return;
    const billExists = company.bills.some((bill) => bill.id === openBillId);
    if (!billExists) return;
    setExpandedBillId(openBillId);
    setOpenBillId(null);
  }, [company, openBillId, setOpenBillId]);

  const filteredBills = useMemo(() => {
    if (!company) return [];

    const query = search.trim().toLowerCase();
    return company.bills.filter((bill) => {
      const matchesSearch =
        !query ||
        bill.billName.toLowerCase().includes(query) ||
        bill.billNumber.toLowerCase().includes(query);

      const status = billStatus(bill);
      const matchesStatus = statusFilter === 'all' || statusFilter === status;
      return matchesSearch && matchesStatus;
    });
  }, [company, search, statusFilter]);

  const totalBills = company?.bills.length || 0;
  const totalCredit = company?.totalCredit || 0;
  const totalDebit = company?.totalDebit || 0;
  const totalBalance = company?.balance || 0;

  const openEditBill = (bill: Bill) => {
    setEditingBill(bill);
    setEditForm({
      billNo: bill.billNumber,
      billName: bill.billName,
      billAmount: String(bill.totalAmount),
      dateCreated: bill.createdDate,
    });
  };

  const saveBillEdit = () => {
    if (!company || !editingBill) return;

    const amount = Number(editForm.billAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Bill amount must be greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    handleUpdateBill(company.id, editingBill.id, {
      billNo: editForm.billNo.trim(),
      billName: editForm.billName.trim() || editForm.billNo.trim(),
      billAmount: amount,
      dateCreated: editForm.dateCreated,
    });

    setEditingBill(null);
    toast({ title: 'Bill updated' });
  };

  const removeBill = (bill: Bill) => {
    if (!company) return;
    const confirmed = window.confirm(`Delete ${bill.billNumber}?`);
    if (!confirmed) return;
    handleDeleteBill(company.id, bill.id);
    if (expandedBillId === bill.id) setExpandedBillId(null);
    toast({ title: 'Bill deleted' });
  };

  if (!company) {
    return (
      <PageLayout>
        <div className="space-y-4">
          <Button variant="outline" onClick={() => navigate('/business')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Companies
          </Button>
          <Card className="p-6 text-center text-muted-foreground">Company not found.</Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6 pb-24 md:pb-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Button variant="ghost" className="mb-2 -ml-3" onClick={() => navigate('/business')}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Companies
            </Button>
            <h1 className="text-2xl font-bold text-foreground">{company.companyName}</h1>
            <p className="text-sm text-muted-foreground">
              {company.ownerName ? `Owner: ${company.ownerName}` : 'Owner details not set'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard title="Bills" value={totalBills} subtitle="Company bills" icon={<Plus className="w-5 h-5 text-primary" />} />
          <SummaryCard title="Total Credit" value={`₹${totalCredit.toLocaleString()}`} subtitle="Bill amounts" icon={<Plus className="w-5 h-5 text-primary" />} />
          <SummaryCard title="Total Debit" value={`₹${totalDebit.toLocaleString()}`} subtitle="Transactions" icon={<Plus className="w-5 h-5 text-primary" />} />
          <SummaryCard title="Balance" value={`₹${totalBalance.toLocaleString()}`} subtitle="Outstanding" icon={<Plus className="w-5 h-5 text-destructive" />} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bills"
            aria-label="Search bills"
            className="md:col-span-2"
          />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'paid' | 'pending' | 'completed')}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Partial</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {filteredBills.map((bill) => {
            const status = billStatus(bill);
            const expanded = expandedBillId === bill.id;

            return (
              <Card key={bill.id} className="p-4 border-border hover:border-primary/30 transition-colors">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      className="text-left flex-1"
                      onClick={() => navigate(`/business/company/${encodeURIComponent(company.id)}/bill/${encodeURIComponent(bill.id)}`)}
                    >
                      <h3 className="font-semibold text-foreground">{bill.billName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {bill.billNumber} • {new Date(bill.createdDate).toLocaleDateString()}
                      </p>
                    </button>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={status} />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => setExpandedBillId(expanded ? null : bill.id)}
                      >
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditBill(bill)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeBill(bill)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Amount (Credit)</p>
                      <p className="font-semibold text-foreground">₹{bill.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Paid Amount (Debit)</p>
                      <p className="font-semibold text-primary">₹{bill.totalDebit.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className="font-semibold text-destructive">₹{bill.balance.toLocaleString()}</p>
                    </div>
                  </div>

                  {expanded && (
                    <div className="pt-3 border-t border-border text-sm text-muted-foreground">
                      <p>
                        Transactions: {bill.transactions.length}
                      </p>
                      {bill.transactions[0] && (
                        <p>
                          Latest: {bill.transactions[0].particular} on {new Date(bill.transactions[0].date).toLocaleDateString()}
                        </p>
                      )}
                      <Button
                        className="mt-3"
                        variant="outline"
                        onClick={() =>
                          navigate(`/business/company/${encodeURIComponent(company.id)}/bill/${encodeURIComponent(bill.id)}`)
                        }
                      >
                        Open Transactions
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}

          {filteredBills.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">
              {company.bills.length === 0 ? 'No bills yet. Use Add Bill to create the first one.' : 'No bills match current filters.'}
            </Card>
          )}
        </div>

        <AddBillModal
          onAddBill={handleAddBill}
          lockCompany
          presetCompany={{ id: company.id, name: company.companyName }}
          triggerLabel="Add Bill"
          triggerIconOnly
          triggerClassName="fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full shadow-lg md:bottom-6 md:right-6"
        />

        <Dialog open={Boolean(editingBill)} onOpenChange={(open) => !open && setEditingBill(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Bill</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="edit-bill-number">Bill Number</Label>
                <Input
                  id="edit-bill-number"
                  value={editForm.billNo}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, billNo: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bill-name">Bill Name</Label>
                <Input
                  id="edit-bill-name"
                  value={editForm.billName}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, billName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bill-amount">Total Amount</Label>
                <Input
                  id="edit-bill-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={editForm.billAmount}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, billAmount: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-created-date">Created Date</Label>
                <Input
                  id="edit-created-date"
                  type="date"
                  value={editForm.dateCreated}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, dateCreated: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setEditingBill(null)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={saveBillEdit}>
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
