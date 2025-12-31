import { X, Check, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Bill } from '@/types/expense';
import { format } from 'date-fns';

interface PaymentTrackerModalProps {
  bill: Bill;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPaymentClick: () => void;
}

export function PaymentTrackerModal({ bill, open, onOpenChange, onAddPaymentClick }: PaymentTrackerModalProps) {
  const progressPercent = (bill.paid / bill.billAmount) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Payment Progress - {bill.billNo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bill Info */}
          <div className="bg-accent/30 rounded-xl p-4">
            <h3 className="font-semibold text-foreground text-lg">{bill.name}</h3>
            <p className="text-sm text-muted-foreground">
              Created: {format(new Date(bill.dateCreated), 'PPP')}
            </p>
          </div>

          {/* Payment Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-card border border-border rounded-lg">
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-lg font-bold text-foreground">${bill.billAmount.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="text-lg font-bold text-primary">${bill.paid.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="text-lg font-bold text-destructive">${bill.balance.toLocaleString()}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{progressPercent.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>

          {/* Payment Timeline */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Payment History
            </h4>
            {bill.payments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No payments recorded yet
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {bill.payments.map((payment, index) => (
                  <div
                    key={payment.id}
                    className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">
                        ${payment.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {payment.note || 'Payment'} • {format(new Date(payment.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Button */}
          {bill.status === 'pending' && (
            <Button className="w-full" onClick={onAddPaymentClick}>
              <DollarSign className="w-4 h-4 mr-2" />
              Add Payment
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
