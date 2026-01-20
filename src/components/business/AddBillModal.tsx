import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface AddBillModalProps {
  onAddBill: (bill: {
    billNo: string;
    billAmount: number;
    dateCreated: string;
  }) => void;
}

export function AddBillModal({ onAddBill }: AddBillModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    billNo: '',
    billAmount: '',
    dateCreated: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBill({
      billNo: formData.billNo,
      billAmount: parseFloat(formData.billAmount),
      dateCreated: formData.dateCreated,
    });
    setFormData({
      billNo: '',
      billAmount: '',
      dateCreated: new Date().toISOString().split('T')[0],
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Bill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Bill</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="billNo">Deal Name</Label>
            <Input
              id="billNo"
              placeholder="Enter deal name"
              value={formData.billNo}
              onChange={(e) => setFormData({ ...formData, billNo: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billAmount">Bill Amount (₹)</Label>
            <Input
              id="billAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.billAmount}
              onChange={(e) => setFormData({ ...formData, billAmount: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateCreated">Date Created</Label>
            <Input
              id="dateCreated"
              type="date"
              value={formData.dateCreated}
              onChange={(e) => setFormData({ ...formData, dateCreated: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Bill
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
