import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { PageLayout } from '@/components/layout/PageLayout';
import { ExpenseTable } from '@/components/personal/ExpenseTable';
import { AddExpenseModal } from '@/components/personal/AddExpenseModal';
import { CategorySummaryCards } from '@/components/personal/CategorySummaryCards';
import { SummaryCard } from '@/components/common/SummaryCard';
import { ExportButtons } from '@/components/common/ExportButtons';
import { Expense } from '@/types/expense';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import { createId } from '@/lib/id';
import { Wallet, TrendingDown, Calendar, PieChart } from 'lucide-react';

export default function Personal() {
  const [expenses, setExpenses] = useLocalStorageState<Expense[]>(STORAGE_KEYS.expenses, []);

  const handleAddExpense = (expenseData: {
    category: string;
    description: string;
    amount: number;
    date: string;
  }) => {
    const newExpense: Expense = {
      id: createId(),
      ...expenseData,
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const handleUpdateExpense = (expenseId: string, updates: { category: string; description: string; amount: number; date: string }) => {
    setExpenses((prev) =>
      prev.map((expense) =>
        expense.id === expenseId
          ? { ...expense, ...updates }
          : expense,
      ),
    );
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId));
  };

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoriesCount = new Set(expenses.map(e => e.category)).size;
  const thisMonthExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() &&
           expenseDate.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const avgExpense = expenses.length ? totalSpent / expenses.length : 0;

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Personal Expenses</h1>
            <p className="text-muted-foreground">Track your personal spending</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ExportButtons />
            <AddExpenseModal onAddExpense={handleAddExpense} />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Spent"
            value={`₹${totalSpent.toLocaleString()}`}
            icon={<Wallet className="w-5 h-5 text-primary" />}
            subtitle={`${expenses.length} transactions`}
          />
          <SummaryCard
            title="This Month"
            value={`₹${thisMonthTotal.toLocaleString()}`}
            icon={<Calendar className="w-5 h-5 text-primary" />}
            subtitle={`${thisMonthExpenses.length} expenses`}
          />
          <SummaryCard
            title="Average"
            value={`₹${avgExpense.toFixed(2)}`}
            icon={<TrendingDown className="w-5 h-5 text-primary" />}
            subtitle="Per transaction"
          />
          <SummaryCard
            title="Categories"
            value={categoriesCount}
            icon={<PieChart className="w-5 h-5 text-primary" />}
            subtitle="Active categories"
          />
        </div>

        {/* Category Summary */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Spending by Category</h2>
          <CategorySummaryCards expenses={expenses} />
        </div>

        {/* Expenses Table */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Recent Expenses</h2>
          <ExpenseTable
            expenses={expenses}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        </div>
      </div>
    </PageLayout>
  );
}
