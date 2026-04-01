import { useMemo, useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { ExportButtons } from '@/components/common/ExportButtons';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import { Expense } from '@/types/expense';
import { useBusinessBills } from '@/hooks/useBusinessBills';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ReportView = 'weekly' | 'monthly' | 'yearly';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Reports() {
  const { bills } = useBusinessBills();
  const [expenses] = useLocalStorageState<Expense[]>(STORAGE_KEYS.expenses, []);

  const today = new Date();
  const [reportView, setReportView] = useState<ReportView>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(String(today.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()));

  const availableYears = useMemo(() => {
    const years = new Set<number>([today.getFullYear()]);
    bills.forEach((bill) => {
      const date = new Date(bill.createdDate || bill.dateCreated);
      if (!Number.isNaN(date.getTime())) years.add(date.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [bills, today]);

  const filteredBills = useMemo(() => {
    const year = Number(selectedYear);
    const month = Number(selectedMonth);

    return bills.filter((bill) => {
      const date = new Date(bill.createdDate || bill.dateCreated);
      if (Number.isNaN(date.getTime())) return false;
      if (date.getFullYear() !== year) return false;
      if (reportView === 'yearly') return true;
      return date.getMonth() + 1 === month;
    });
  }, [bills, reportView, selectedMonth, selectedYear]);

  const filteredPaid = filteredBills.reduce((sum, bill) => sum + bill.totalDebit, 0);
  const filteredBalance = filteredBills.reduce((sum, bill) => sum + bill.balance, 0);

  const paidBalanceChartData = useMemo(
    () => [
      {
        metric: 'Paid',
        amount: filteredPaid,
        color: 'hsl(var(--primary))',
      },
      {
        metric: 'Balance',
        amount: filteredBalance,
        color: 'hsl(var(--destructive))',
      },
    ],
    [filteredPaid, filteredBalance],
  );

  // Personal expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--muted))',
  ];

  const totalBillAmount = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const totalPaid = bills.reduce((sum, bill) => sum + bill.totalDebit, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <PageLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Analyze your financial data</p>
          </div>
          <ExportButtons />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <p className="text-sm text-muted-foreground">Total Business</p>
            <p className="text-2xl font-bold text-foreground">₹{totalBillAmount.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <p className="text-2xl font-bold text-primary">₹{totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <p className="text-sm text-muted-foreground">Personal Expenses</p>
            <p className="text-2xl font-bold text-foreground">₹{totalExpenses.toLocaleString()}</p>
          </div>
        </div>

        {/* Business Reports */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Business Reports</h2>
            <p className="text-sm text-muted-foreground">Paid and Balance reports with period filters.</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-2">View</p>
                <Select value={reportView} onValueChange={(value) => setReportView(value as ReportView)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Month</p>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger disabled={reportView === 'yearly'}>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_NAMES.map((monthName, index) => (
                      <SelectItem key={monthName} value={String(index + 1)}>
                        {monthName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Year</p>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="bg-accent/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-primary">₹{filteredPaid.toLocaleString()}</p>
              </div>
              <div className="bg-accent/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-2xl font-bold text-destructive">₹{filteredBalance.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Paid vs Balance</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paidBalanceChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="metric"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                  />
                  <Bar dataKey="amount" name="Amount" radius={[6, 6, 0, 0]}>
                    {paidBalanceChartData.map((entry) => (
                      <Cell key={entry.metric} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Personal Reports */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Personal Reports</h2>
            <p className="text-sm text-muted-foreground">Personal spending by category.</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Expenses by Category</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {pieData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    No expense data to display.
                  </div>
                ) : (
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => {
                  const percentage = totalExpenses ? (amount / totalExpenses) * 100 : 0;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">{category}</span>
                        <span className="font-medium text-foreground">₹{amount.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-accent rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
