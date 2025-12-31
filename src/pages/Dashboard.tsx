import { PageLayout } from '@/components/layout/PageLayout';
import { SummaryCard } from '@/components/common/SummaryCard';
import { mockBills, mockExpenses } from '@/data/mockData';
import { 
  Briefcase, 
  User, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  Receipt,
  Wallet
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/common/StatusBadge';
import { format } from 'date-fns';

export default function Dashboard() {
  const totalBillAmount = mockBills.reduce((sum, bill) => sum + bill.billAmount, 0);
  const totalPaid = mockBills.reduce((sum, bill) => sum + bill.paid, 0);
  const totalBalance = mockBills.reduce((sum, bill) => sum + bill.balance, 0);
  const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const pendingBills = mockBills.filter(bill => bill.status === 'pending');
  const recentExpenses = mockExpenses.slice(0, 5);

  return (
    <PageLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your finances</p>
        </div>

        {/* Main Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Business Bills"
            value={`$${totalBillAmount.toLocaleString()}`}
            icon={<Briefcase className="w-5 h-5 text-primary" />}
            subtitle={`${mockBills.length} total bills`}
          />
          <SummaryCard
            title="Amount Paid"
            value={`$${totalPaid.toLocaleString()}`}
            icon={<TrendingUp className="w-5 h-5 text-primary" />}
            subtitle="Across all bills"
          />
          <SummaryCard
            title="Outstanding"
            value={`$${totalBalance.toLocaleString()}`}
            icon={<TrendingDown className="w-5 h-5 text-destructive" />}
            subtitle={`${pendingBills.length} pending`}
          />
          <SummaryCard
            title="Personal Expenses"
            value={`$${totalExpenses.toLocaleString()}`}
            icon={<User className="w-5 h-5 text-primary" />}
            subtitle={`${mockExpenses.length} transactions`}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending Bills */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Pending Bills</h2>
              </div>
              <Link 
                to="/business" 
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {pendingBills.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No pending bills
                </p>
              ) : (
                pendingBills.slice(0, 4).map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{bill.name}</p>
                      <p className="text-xs text-muted-foreground">{bill.billNo}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="font-semibold text-destructive">
                        ${bill.balance.toLocaleString()}
                      </p>
                      <StatusBadge status={bill.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Recent Expenses</h2>
              </div>
              <Link 
                to="/personal" 
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentExpenses.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No recent expenses
                </p>
              ) : (
                recentExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">{expense.category}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="font-semibold text-foreground">
                        ${expense.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(expense.date), 'MMM d')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to="/business"
            className="flex items-center gap-4 p-5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
          >
            <div className="p-3 bg-primary-foreground/10 rounded-lg">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">Manage Business Bills</h3>
              <p className="text-sm opacity-80">Track payments and invoices</p>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto" />
          </Link>
          <Link
            to="/personal"
            className="flex items-center gap-4 p-5 bg-secondary text-secondary-foreground rounded-xl hover:opacity-90 transition-opacity"
          >
            <div className="p-3 bg-secondary-foreground/10 rounded-lg">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">Track Personal Expenses</h3>
              <p className="text-sm opacity-80">Monitor your spending</p>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto" />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
