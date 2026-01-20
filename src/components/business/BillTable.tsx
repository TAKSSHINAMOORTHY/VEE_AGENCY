import { Fragment, useEffect, useMemo, useState } from 'react';
import { Bill } from '@/types/expense';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { LedgerPrintModal } from './LedgerPrintModal';

interface BillTableProps {
  bills: Bill[];
  onAddPayment: (billId: string, amount: number, date: string, note?: string) => void;
  openBillId?: string | null;
  onOpenBillHandled?: () => void;
}

export function BillTable({ bills, onAddPayment, openBillId, onOpenBillHandled }: BillTableProps) {
  const [expandedBillId, setExpandedBillId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!openBillId) return;
    const billToOpen = bills.find((b) => b.id === openBillId);
    if (!billToOpen) return;
    setExpandedBillId(billToOpen.id);
    setPaymentAmount('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    onOpenBillHandled?.();
  }, [bills, onOpenBillHandled, openBillId]);

  const expandedBill = useMemo(
    () => bills.find((b) => b.id === expandedBillId) ?? null,
    [bills, expandedBillId],
  );

  const sortedPayments = useMemo(() => {
    if (!expandedBill) return [];
    return expandedBill.payments
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [expandedBill]);

  const toggleExpanded = (billId: string) => {
    setExpandedBillId((prev) => {
      const next = prev === billId ? null : billId;
      setPaymentAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      return next;
    });
  };

  const handleAddPaymentSubmit = (bill: Bill) => {
    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({
        title: 'Invalid payment amount',
        description: 'Enter a number greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    if (bill.paid + amount > bill.billAmount) {
      toast({
        title: 'Overpayment not allowed',
        description: `Max you can pay is ₹${bill.balance.toLocaleString()}.`,
        variant: 'destructive',
      });
      return;
    }

    onAddPayment(bill.id, amount, paymentDate);
    setPaymentAmount('');
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-accent/30">
                <TableHead className="font-semibold">Bill No</TableHead>
                <TableHead className="font-semibold text-right">Bill Amount</TableHead>
                <TableHead className="font-semibold text-right">Paid</TableHead>
                <TableHead className="font-semibold text-right">Balance</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Date Created</TableHead>
                <TableHead className="font-semibold">Due Date</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((bill) => (
                <Fragment key={bill.id}>
                  <TableRow
                    className="hover:bg-accent/20 transition-colors cursor-pointer"
                    onClick={() => toggleExpanded(bill.id)}
                  >
                    <TableCell className="font-medium">{bill.billNo}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-foreground">
                        ₹{bill.billAmount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-primary font-medium">
                      ₹{bill.paid.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-destructive font-medium">
                      ₹{bill.balance.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={bill.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(bill.dateCreated), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {Math.floor((new Date().getTime() - new Date(bill.dateCreated).getTime()) / (1000 * 60 * 60 * 24))} days
                    </TableCell>
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <LedgerPrintModal bill={bill} />
                    </TableCell>
                  </TableRow>

                  {expandedBillId === bill.id && (
                    <TableRow className="bg-accent/10">
                      <TableCell colSpan={8} className="py-4">
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-foreground">Payment Log</h4>
                            </div>

                            {bill.payments.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No payments yet.</p>
                            ) : (
                              <div className="space-y-2">
                                {(() => {
                                  let runningTotal = 0;
                                  return sortedPayments.map((payment) => {
                                    runningTotal += payment.amount;
                                    const fullyPaidAfterThis = runningTotal === bill.billAmount;
                                    return (
                                      <div
                                        key={payment.id}
                                        className="flex items-center justify-between text-sm bg-card border border-border rounded-lg px-3 py-2"
                                      >
                                        <span className="text-foreground">
                                          {format(new Date(payment.date), 'MMM d, yyyy')}
                                        </span>
                                        <span className="text-muted-foreground">
                                          Paid ₹{payment.amount.toLocaleString()}
                                          {fullyPaidAfterThis ? ' (Bill Fully Paid)' : ''}
                                        </span>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            )}
                          </div>

                          <div className="border-t border-border pt-4">
                            <h4 className="font-medium text-foreground mb-3">Add Payment</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="sm:col-span-1">
                                <Input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  placeholder="Amount"
                                  value={paymentAmount}
                                  onChange={(e) => setPaymentAmount(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div className="sm:col-span-1">
                                <Input
                                  type="date"
                                  value={paymentDate}
                                  onChange={(e) => setPaymentDate(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div className="sm:col-span-1">
                                <Button
                                  className="w-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddPaymentSubmit(bill);
                                  }}
                                  disabled={bill.balance === 0}
                                >
                                  Add Payment
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Balance updates instantly. Overpayment is blocked.
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
              {bills.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No bills found. Create your first bill to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
