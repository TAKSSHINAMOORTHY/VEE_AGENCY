import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { AddBillModal } from '@/components/business/AddBillModal';
import { SummaryCard } from '@/components/common/SummaryCard';
import { ExportButtons } from '@/components/common/ExportButtons';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { useBusinessBills } from '@/hooks/useBusinessBills';
import { Company } from '@/types/company';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Receipt, DollarSign, AlertCircle, CheckCircle, Plus } from 'lucide-react';

type CompanyRow = {
  id: string;
  companyName: string;
  ownerName?: string;
  totalBillAmount: number;
  totalPaid: number;
  totalBalance: number;
  status: 'paid' | 'pending' | 'completed';
};

const normalizeName = (value: string) => value.trim().toLowerCase();

export default function Business() {
  const navigate = useNavigate();
  const { bills, handleAddBill, totals } = useBusinessBills();
  const [companies] = useLocalStorageState<Company[]>(STORAGE_KEYS.companies, []);
  const [search, setSearch] = useState('');

  const companyRows = useMemo<CompanyRow[]>(() => {
    const companyById = new Map(companies.map((c) => [c.id, c]));
    const companyByName = new Map(companies.map((c) => [normalizeName(c.companyName), c]));
    const grouped = new Map<string, CompanyRow & { statusSet: Set<string> }>();

    bills.forEach((bill) => {
      const nameKey = normalizeName(bill.name || 'Unknown Company');
      const byId = bill.companyId ? companyById.get(bill.companyId) : undefined;
      const byName = companyByName.get(nameKey);
      const resolvedCompany = byId ?? byName;

      const key = resolvedCompany?.id ? `id-${resolvedCompany.id}` : `name-${nameKey}`;
      const row = grouped.get(key) ?? {
        id: key,
        companyName: resolvedCompany?.companyName || bill.name || 'Unknown Company',
        ownerName: resolvedCompany?.ownerName,
        totalBillAmount: 0,
        totalPaid: 0,
        totalBalance: 0,
        status: 'pending' as const,
        statusSet: new Set<string>(),
      };

      row.totalBillAmount += bill.billAmount;
      row.totalPaid += bill.paid;
      row.totalBalance += bill.balance;
      row.statusSet.add(bill.status);
      grouped.set(key, row);
    });

    return Array.from(grouped.values())
      .map((row) => {
        const statuses = row.statusSet;
        const hasPending = statuses.has('pending');
        const hasPaidLike = statuses.has('paid') || statuses.has('completed');
        let status: CompanyRow['status'] = 'pending';
        if (hasPending && hasPaidLike) status = 'completed';
        else if (hasPaidLike && !hasPending) status = 'paid';

        return {
          id: row.id,
          companyName: row.companyName,
          ownerName: row.ownerName,
          totalBillAmount: row.totalBillAmount,
          totalPaid: row.totalPaid,
          totalBalance: row.totalBalance,
          status,
        };
      })
      .sort((a, b) => a.companyName.localeCompare(b.companyName));
  }, [bills, companies]);

  const pendingCount = companyRows.filter((row) => row.status !== 'paid').length;
  const filteredCompanyRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return companyRows;

    const startsWithMatches: CompanyRow[] = [];
    const containsMatches: CompanyRow[] = [];

    companyRows.forEach((company) => {
      const companyName = company.companyName.toLowerCase();
      const ownerName = (company.ownerName || '').toLowerCase();
      const startsWith = companyName.startsWith(query) || ownerName.startsWith(query);
      const contains = companyName.includes(query) || ownerName.includes(query);

      if (startsWith) {
        startsWithMatches.push(company);
      } else if (contains) {
        containsMatches.push(company);
      }
    });

    return [...startsWithMatches, ...containsMatches];
  }, [companyRows, search]);

  return (
    <PageLayout>
      <div className="space-y-6 text-[0.95rem]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Business Bills</h1>
            <p className="text-sm text-muted-foreground">Track and manage your business expenses</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ExportButtons />
            <Button className="gap-2" onClick={() => navigate('/companies')}>
              <Plus className="w-4 h-4" />
              Add Company
            </Button>
            <AddBillModal onAddBill={handleAddBill} />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Bills"
            value={`₹${totals.totalBills.toLocaleString()}`}
            icon={<Receipt className="w-5 h-5 text-primary" />}
            subtitle={`${bills.length} bills`}
          />
          <SummaryCard
            title="Total Paid"
            value={`₹${totals.totalPaid.toLocaleString()}`}
            icon={<DollarSign className="w-5 h-5 text-primary" />}
            subtitle={`${totals.paidCount} paid`}
          />
          <SummaryCard
            title="Outstanding"
            value={`₹${totals.totalBalance.toLocaleString()}`}
            icon={<AlertCircle className="w-5 h-5 text-destructive" />}
            subtitle={`${pendingCount} companies pending`}
          />
          <SummaryCard
            title="Completion Rate"
            value={`${companyRows.length ? Math.round(((companyRows.length - pendingCount) / companyRows.length) * 100) : 0}%`}
            icon={<CheckCircle className="w-5 h-5 text-primary" />}
            subtitle="Companies settled"
          />
        </div>

        <div className="max-w-md">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company or owner"
            aria-label="Search companies"
          />
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-accent/30">
                  <TableHead className="font-semibold">Company Name</TableHead>
                  <TableHead className="font-semibold">Owner Name</TableHead>
                  <TableHead className="font-semibold text-right">Total Bill Amount</TableHead>
                  <TableHead className="font-semibold text-right">Total Paid</TableHead>
                  <TableHead className="font-semibold text-right">Outstanding Balance</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanyRows.map((company) => (
                  <TableRow
                    key={company.id}
                    className="hover:bg-accent/20 transition-colors cursor-pointer"
                    onClick={() => navigate(`/business/company/${encodeURIComponent(company.id)}`)}
                  >
                    <TableCell className="font-medium">{company.companyName}</TableCell>
                    <TableCell>{company.ownerName || '-'}</TableCell>
                    <TableCell className="text-right font-semibold">₹{company.totalBillAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-primary font-medium">₹{company.totalPaid.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-destructive font-medium">₹{company.totalBalance.toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={company.status} />
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCompanyRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {companyRows.length === 0
                        ? 'No company bills found. Create your first bill to get started.'
                        : 'No companies found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
