import { useEffect, useMemo, useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Bill } from '@/types/expense';
import { toast } from '@/hooks/use-toast';

interface EditBillModalProps {
  bill: Bill;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateBill: (billId: string, updates: { billAmount: number; paidAmount?: number }) => void;
}

export function EditBillModal({ bill, open, onOpenChange, onUpdateBill }: EditBillModalProps) {
  const initialBillAmount = useMemo(() => bill.billAmount.toString(), [bill.billAmount]);
  const initialPaid = useMemo(() => bill.paid.toString(), [bill.paid]);

  const [billAmount, setBillAmount] = useState(initialBillAmount);
  const [paidAmount, setPaidAmount] = useState(initialPaid);

  useEffect(() => {
    setBillAmount(initialBillAmount);
    setPaidAmount(initialPaid);
  }, [initialBillAmount, initialPaid, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextBillAmount = Number(billAmount);
    const nextPaid = Number(paidAmount);

    if (!Number.isFinite(nextBillAmount) || nextBillAmount <= 0) {
      toast({
        title: 'Invalid bill amount',
        description: 'Bill amount must be a number greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    if (!Number.isFinite(nextPaid) || nextPaid < 0) {
      toast({
        title: 'Invalid paid amount',
        description: 'Paid amount must be a number 0 or greater.',
        variant: 'destructive',
      });
      return;
    }

    if (nextPaid > nextBillAmount) {
      toast({
        title: 'Paid exceeds bill',
        description: 'Paid amount cannot be greater than the bill amount.',
        variant: 'destructive',
      });
      return;
    }

    onUpdateBill(bill.id, { billAmount: nextBillAmount, paidAmount: nextPaid });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-4 h-4" />
            Edit Bill
          </DialogTitle>
        </DialogHeader>

        <div className="bg-accent/50 rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground">Bill: {bill.name ?? bill.billNo}</p>
          <p className="text-xs text-muted-foreground">Bill No: {bill.billNo}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="billAmount">Bill Amount (₹)</Label>
            <Input
              id="billAmount"
              type="number"
              min="0.01"
              step="0.01"
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidAmount">Paid Amount (₹)</Label>
            <Input
              id="paidAmount"
              type="number"
              min="0"
              step="0.01"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              This will set the paid amount directly.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
