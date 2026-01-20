import { Expense } from '@/types/expense';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
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

interface ExpenseTableProps {
  expenses: Expense[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Food & Dining': <Utensils className="w-4 h-4" />,
  'Transportation': <Car className="w-4 h-4" />,
  'Shopping': <ShoppingBag className="w-4 h-4" />,
  'Entertainment': <Film className="w-4 h-4" />,
  'Bills & Utilities': <Zap className="w-4 h-4" />,
  'Healthcare': <Heart className="w-4 h-4" />,
  'Travel': <Plane className="w-4 h-4" />,
  'Other': <MoreHorizontal className="w-4 h-4" />,
};

export function ExpenseTable({ expenses }: ExpenseTableProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-accent/30">
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Description</TableHead>
              <TableHead className="font-semibold text-right">Amount</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id} className="hover:bg-accent/20 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      {categoryIcons[expense.category] || categoryIcons['Other']}
                    </div>
                    <span className="font-medium">{expense.category}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {expense.description}
                </TableCell>
                <TableCell className="text-right font-semibold text-destructive">
                  ₹{expense.amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(expense.date), 'MMM d, yyyy')}
                </TableCell>
              </TableRow>
            ))}
            {expenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No expenses found. Add your first expense to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
