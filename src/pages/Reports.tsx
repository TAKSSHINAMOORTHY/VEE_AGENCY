import { PageLayout } from '@/components/layout/PageLayout';
import { mockBills, mockExpenses } from '@/data/mockData';
import { ExportButtons } from '@/components/common/ExportButtons';
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

export default function Reports() {
  // Business data for chart
  const billsData = mockBills.map(bill => ({
    name: bill.name.length > 15 ? bill.name.substring(0, 15) + '...' : bill.name,
    paid: bill.paid,
    balance: bill.balance,
  }));

  // Personal expenses by category
  const expensesByCategory = mockExpenses.reduce((acc, expense) => {
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

  const totalBillAmount = mockBills.reduce((sum, bill) => sum + bill.billAmount, 0);
  const totalPaid = mockBills.reduce((sum, bill) => sum + bill.paid, 0);
  const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0);

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
            <p className="text-2xl font-bold text-foreground">${totalBillAmount.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <p className="text-2xl font-bold text-primary">${totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <p className="text-sm text-muted-foreground">Personal Expenses</p>
            <p className="text-2xl font-bold text-foreground">${totalExpenses.toLocaleString()}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Business Bills Chart */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-foreground mb-4">Business Bills Overview</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={billsData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="paid" fill="hsl(var(--primary))" name="Paid" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="balance" fill="hsl(var(--destructive))" name="Balance" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Personal Expenses Pie Chart */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-foreground mb-4">Expenses by Category</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
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
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Data Tables */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Business Summary */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-foreground mb-4">Business Summary</h2>
            <div className="space-y-3">
              {mockBills.map((bill) => (
                <div key={bill.id} className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{bill.name}</p>
                    <p className="text-xs text-muted-foreground">{bill.billNo}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">${bill.billAmount.toLocaleString()}</p>
                    <p className="text-xs text-primary">Paid: ${bill.paid.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-foreground mb-4">Category Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => {
                  const percentage = (amount / totalExpenses) * 100;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">{category}</span>
                        <span className="font-medium text-foreground">${amount.toLocaleString()}</span>
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
        </div>
      </div>
    </PageLayout>
  );
}
