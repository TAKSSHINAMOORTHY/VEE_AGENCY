import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, FileText } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { useBusinessBills } from '@/hooks/useBusinessBills';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import type { Company } from '@/types/company';
import { SummaryCard } from '@/components/common/SummaryCard';
import { BillTable } from '@/components/business/BillTable';
import { AddBillModal } from '@/components/business/AddBillModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const normalizeName = (value: string) => value.trim().toLowerCase();

export default function BusinessCompanyDetail() {
  const navigate = useNavigate();
  const { companyId } = useParams<{ companyId: string }>();
  const decodedCompanyId = decodeURIComponent(companyId || '');
  const [companies] = useLocalStorageState<Company[]>(STORAGE_KEYS.companies, []);
  const {
    bills,
    openBillId,
    setOpenBillId,
    handleAddPayment,
    handleUpdatePayment,
    handleDeletePayment,
    handleAddBill,
    handleAddCompanyTransaction,
  } = useBusinessBills();

  const [selectedBillId, setSelectedBillId] = useState<string>('none');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const companyView = useMemo(() => {
    const companyById = new Map(companies.map((c) => [c.id, c]));
    const companyByName = new Map(companies.map((c) => [normalizeName(c.companyName), c]));

    const companyBills = bills.filter((bill) => {
      const matchedById = bill.companyId ? `id-${bill.companyId}` : '';
      const matchedByName = `name-${normalizeName(bill.name || 'Unknown Company')}`;
      if (decodedCompanyId.startsWith('id-')) {
        const id = decodedCompanyId.replace('id-', '');
        if (bill.companyId === id) return true;
        const byName = bill.name ? companyByName.get(normalizeName(bill.name)) : undefined;
        return byName?.id === id;
      }
      return decodedCompanyId === matchedById || decodedCompanyId === matchedByName;
    });

    const firstBill = companyBills[0];
    const resolvedCompany = (() => {
      if (decodedCompanyId.startsWith('id-')) {
        const id = decodedCompanyId.replace('id-', '');
        return companyById.get(id);
      }
      if (firstBill?.companyId) {
        const byId = companyById.get(firstBill.companyId);
        if (byId) return byId;
      }
      if (firstBill?.name) {
        return companyByName.get(normalizeName(firstBill.name));
      }
      return undefined;
    })();

    const companyName = resolvedCompany?.companyName || firstBill?.name || 'Unknown Company';
    const totalBillAmount = companyBills.reduce((sum, bill) => sum + bill.billAmount, 0);
    const totalPaid = companyBills.reduce((sum, bill) => sum + bill.paid, 0);
    const totalBalance = companyBills.reduce((sum, bill) => sum + bill.balance, 0);

    return {
      resolvedCompany,
      companyName,
      companyBills,
      totalBillAmount,
      totalPaid,
      totalBalance,
    };
  }, [bills, companies, decodedCompanyId]);

  const generateCompanyReport = () => {
    const reportRows = companyView.companyBills
      .map((bill) => {
        const payments = bill.payments
          .map((payment) => `
            <tr>
              <td style="padding:6px;border:1px solid #ddd;">${new Date(payment.date).toLocaleDateString()}</td>
              <td style="padding:6px;border:1px solid #ddd;">₹${payment.amount.toLocaleString()}</td>
              <td style="padding:6px;border:1px solid #ddd;">${payment.note || '-'}</td>
            </tr>
          `)
          .join('');

        return `
          <section style="margin-bottom:20px;">
            <h3 style="margin-bottom:8px;">${bill.billNo} (${bill.name || '-'})</h3>
            <div style="margin-bottom:6px;">Bill Amount: ₹${bill.billAmount.toLocaleString()} | Paid: ₹${bill.paid.toLocaleString()} | Balance: ₹${bill.balance.toLocaleString()}</div>
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
              <thead>
                <tr>
                  <th style="padding:6px;border:1px solid #ddd;text-align:left;">Date</th>
                  <th style="padding:6px;border:1px solid #ddd;text-align:left;">Amount</th>
                  <th style="padding:6px;border:1px solid #ddd;text-align:left;">Note</th>
                </tr>
              </thead>
              <tbody>
                ${payments || '<tr><td colspan="3" style="padding:6px;border:1px solid #ddd;">No payments</td></tr>'}
              </tbody>
            </table>
          </section>
        `;
      })
      .join('');

    const popup = window.open('', '_blank', 'width=1000,height=800');
    if (!popup) return;
    popup.document.write(`
      <html>
        <head>
          <title>${companyView.companyName} - Company Report</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h1 style="margin-top:0;">Company Report: ${companyView.companyName}</h1>
          <p>Total Bills: ${companyView.companyBills.length}</p>
          <p>Total Bill Amount: ₹${companyView.totalBillAmount.toLocaleString()}</p>
          <p>Total Paid: ₹${companyView.totalPaid.toLocaleString()}</p>
          <p>Outstanding Balance: ₹${companyView.totalBalance.toLocaleString()}</p>
          <hr />
          ${reportRows || '<p>No bills found for this company.</p>'}
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  const handleAddDirectTransaction = () => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Enter an amount greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    handleAddCompanyTransaction({
      companyId: companyView.resolvedCompany?.id,
      companyName: companyView.companyName,
      billId: selectedBillId !== 'none' ? selectedBillId : undefined,
      amount: numericAmount,
      date,
      note: note || undefined,
    });

    setAmount('');
    setNote('');
    setSelectedBillId('none');
    toast({ title: 'Transaction added' });
  };

  if (!companyView.companyName || companyView.companyBills.length === 0) {
    return (
      <PageLayout>
        <div className="space-y-4">
          <Button variant="outline" onClick={() => navigate('/business')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Companies
          </Button>
          <Card className="p-6 text-center text-muted-foreground">No records found for this company.</Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <Button variant="ghost" className="mb-2 -ml-3" onClick={() => navigate('/business')}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Companies
            </Button>
            <h1 className="text-2xl font-bold text-foreground">{companyView.companyName}</h1>
            <p className="text-muted-foreground">
              Owner: {companyView.resolvedCompany?.ownerName || '-'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AddBillModal
              triggerLabel="Add Bill"
              lockCompany
              presetCompany={{
                id: companyView.resolvedCompany?.id,
                name: companyView.companyName,
              }}
              onAddBill={handleAddBill}
            />
            <Button onClick={generateCompanyReport} className="gap-2">
              <FileText className="w-4 h-4" />
              Generate Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard title="Total Bills" value={companyView.companyBills.length} icon={<FileText className="w-5 h-5 text-primary" />} />
          <SummaryCard title="Total Paid" value={`₹${companyView.totalPaid.toLocaleString()}`} icon={<FileText className="w-5 h-5 text-primary" />} />
          <SummaryCard title="Balance" value={`₹${companyView.totalBalance.toLocaleString()}`} icon={<FileText className="w-5 h-5 text-destructive" />} />
        </div>

        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-foreground">Add Transaction (Bill-first or Direct)</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-2">
              <Label className="mb-1 block">Select Bill (Optional)</Label>
              <Select value={selectedBillId} onValueChange={setSelectedBillId}>
                <SelectTrigger>
                  <SelectValue placeholder="Direct entry (no bill selected)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Direct entry (create default bill)</SelectItem>
                  {companyView.companyBills.map((bill) => (
                    <SelectItem key={bill.id} value={bill.id}>
                      {bill.billNo} - {bill.name || 'Unnamed'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Amount</Label>
              <Input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1 block">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1 block">Note</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <Button onClick={handleAddDirectTransaction}>Add Transaction</Button>
        </Card>

        <BillTable
          bills={companyView.companyBills}
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
