import { useState } from 'react';
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
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ExpenseTableProps {
  expenses: Expense[];
  onUpdateExpense: (expenseId: string, updates: { category: string; description: string; amount: number; date: string }) => void;
  onDeleteExpense: (expenseId: string) => void;
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

export function ExpenseTable({ expenses, onUpdateExpense, onDeleteExpense }: ExpenseTableProps) {
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');

  const startEdit = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setEditCategory(expense.category);
    setEditDescription(expense.description);
    setEditAmount(String(expense.amount));
    setEditDate(expense.date);
  };

  const cancelEdit = () => {
    setEditingExpenseId(null);
    setEditCategory('');
    setEditDescription('');
    setEditAmount('');
    setEditDate('');
  };

  const saveEdit = (expenseId: string) => {
    const amount = Number(editAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Enter a number greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    onUpdateExpense(expenseId, {
      category: editCategory || 'Other',
      description: editDescription,
      amount,
      date: editDate || new Date().toISOString().split('T')[0],
    });
    cancelEdit();
  };

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
              <TableHead className="font-semibold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id} className="hover:bg-accent/20 transition-colors">
                {editingExpenseId === expense.id ? (
                  <>
                    <TableCell>
                      <Input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button size="sm" onClick={() => saveEdit(expense.id)}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={cancelEdit}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
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
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => startEdit(expense)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onDeleteExpense(expense.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {expenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
