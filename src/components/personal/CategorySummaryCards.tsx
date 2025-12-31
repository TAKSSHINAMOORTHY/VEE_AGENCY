import { Expense } from '@/types/expense';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Film, 
  Zap, 
  Heart, 
  Plane, 
  MoreHorizontal 
} from 'lucide-react';

interface CategorySummaryCardsProps {
  expenses: Expense[];
}

const categoryConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  'Food & Dining': { icon: <Utensils className="w-5 h-5" />, color: 'bg-chart-1' },
  'Transportation': { icon: <Car className="w-5 h-5" />, color: 'bg-chart-2' },
  'Shopping': { icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-chart-3' },
  'Entertainment': { icon: <Film className="w-5 h-5" />, color: 'bg-chart-4' },
  'Bills & Utilities': { icon: <Zap className="w-5 h-5" />, color: 'bg-chart-5' },
  'Healthcare': { icon: <Heart className="w-5 h-5" />, color: 'bg-primary' },
  'Travel': { icon: <Plane className="w-5 h-5" />, color: 'bg-secondary' },
  'Other': { icon: <MoreHorizontal className="w-5 h-5" />, color: 'bg-muted' },
};

export function CategorySummaryCards({ expenses }: CategorySummaryCardsProps) {
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a);

  if (sortedCategories.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {sortedCategories.map(([category, total]) => {
        const config = categoryConfig[category] || categoryConfig['Other'];
        return (
          <div
            key={category}
            className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${config.color} text-primary-foreground`}>
                {config.icon}
              </div>
            </div>
            <p className="text-xs text-muted-foreground truncate">{category}</p>
            <p className="text-lg font-bold text-foreground">${total.toLocaleString()}</p>
          </div>
        );
      })}
    </div>
  );
}
