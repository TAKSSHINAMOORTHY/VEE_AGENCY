import { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Bill } from '@/types/expense';

interface AddPaymentModalProps {
  bill: Bill;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPayment: (billId: string, amount: number, note?: string) => void;
}

export function AddPaymentModal({ bill, open, onOpenChange, onAddPayment }: AddPaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    if (paymentAmount > 0 && paymentAmount <= bill.balance) {
      onAddPayment(bill.id, paymentAmount, note || undefined);
      setAmount('');
      setNote('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
        </DialogHeader>
        <div className="bg-accent/50 rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground">Bill: {bill.name}</p>
          <p className="text-lg font-semibold text-foreground">
            Balance: ₹{bill.balance.toLocaleString()}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              max={bill.balance}
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Maximum: ₹{bill.balance.toLocaleString()}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Input
              id="note"
              placeholder="Payment note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2">
              <DollarSign className="w-4 h-4" />
              Add Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
