import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, DollarSign, Plus, Receipt } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { SummaryCard } from '@/components/common/SummaryCard';
import { ExportButtons } from '@/components/common/ExportButtons';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useBusinessBills } from '@/hooks/useBusinessBills';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function companyStatus(balance: number, totalDebit: number) {
  if (balance === 0 && totalDebit > 0) return 'paid' as const;
  if (totalDebit > 0) return 'completed' as const;
  return 'pending' as const;
}

export default function Business() {
  const navigate = useNavigate();
  const { companies, bills, totals } = useBusinessBills();
  const [search, setSearch] = useState('');

  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return companies;

    const startsWithMatches = companies.filter((company) => {
      const byName = company.companyName.toLowerCase().startsWith(query);
      const byOwner = (company.ownerName || '').toLowerCase().startsWith(query);
      return byName || byOwner;
    });

    const containsMatches = companies.filter((company) => {
      if (startsWithMatches.some((match) => match.id === company.id)) return false;
      const byName = company.companyName.toLowerCase().includes(query);
      const byOwner = (company.ownerName || '').toLowerCase().includes(query);
      return byName || byOwner;
    });

    return [...startsWithMatches, ...containsMatches];
  }, [companies, search]);

  const pendingCompanies = companies.filter((company) => companyStatus(company.balance, company.totalDebit) !== 'paid').length;

  return (
    <PageLayout>
      <div className="space-y-6 text-[0.95rem]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Business</h1>
            <p className="text-sm text-muted-foreground">Company to Bills to Transactions</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ExportButtons />
            <Button className="gap-2" onClick={() => navigate('/companies')}>
              <Plus className="w-4 h-4" />
              Add Company
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Credit"
            value={`₹${totals.totalBills.toLocaleString()}`}
            icon={<Receipt className="w-5 h-5 text-primary" />}
            subtitle={`${companies.length} companies`}
          />
          <SummaryCard
            title="Total Debit"
            value={`₹${totals.totalPaid.toLocaleString()}`}
            icon={<DollarSign className="w-5 h-5 text-primary" />}
            subtitle={`${bills.length} bills`}
          />
          <SummaryCard
            title="Balance"
            value={`₹${totals.totalBalance.toLocaleString()}`}
            icon={<AlertCircle className="w-5 h-5 text-destructive" />}
            subtitle={`${pendingCompanies} companies pending`}
          />
          <SummaryCard
            title="Completion Rate"
            value={`${companies.length ? Math.round(((companies.length - pendingCompanies) / companies.length) * 100) : 0}%`}
            icon={<CheckCircle className="w-5 h-5 text-primary" />}
            subtitle="Company settlement"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCompanies.map((company) => {
            const status = companyStatus(company.balance, company.totalDebit);
            return (
              <Card
                key={company.id}
                className="p-4 border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/business/company/${encodeURIComponent(company.id)}`)}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{company.companyName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {company.ownerName ? `Owner: ${company.ownerName}` : 'Owner details not set'}
                      </p>
                    </div>
                    <StatusBadge status={status} />
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Total Credit</p>
                      <p className="font-semibold text-foreground">₹{company.totalCredit.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Total Debit</p>
                      <p className="font-semibold text-primary">₹{company.totalDebit.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Balance</p>
                      <p className="font-semibold text-destructive">₹{company.balance.toLocaleString()}</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {company.bills.length} bill{company.bills.length === 1 ? '' : 's'}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredCompanies.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            {companies.length === 0
              ? 'No companies found. Add your first company to start billing.'
              : 'No companies match your search.'}
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
