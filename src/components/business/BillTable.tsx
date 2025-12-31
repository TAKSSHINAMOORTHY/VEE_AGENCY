import { useState } from 'react';
import { Bill } from '@/types/expense';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PaymentTrackerModal } from './PaymentTrackerModal';
import { AddPaymentModal } from './AddPaymentModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface BillTableProps {
  bills: Bill[];
  onAddPayment: (billId: string, amount: number, note?: string) => void;
}

export function BillTable({ bills, onAddPayment }: BillTableProps) {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const handleBillAmountClick = (bill: Bill) => {
    setSelectedBill(bill);
    setTrackerOpen(true);
  };

  const handleAddPaymentClick = () => {
    setTrackerOpen(false);
    setPaymentOpen(true);
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-accent/30">
                <TableHead className="font-semibold">Bill No</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold text-right">Bill Amount</TableHead>
                <TableHead className="font-semibold text-right">Paid</TableHead>
                <TableHead className="font-semibold text-right">Balance</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Date Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((bill) => (
                <TableRow key={bill.id} className="hover:bg-accent/20 transition-colors">
                  <TableCell className="font-medium">{bill.billNo}</TableCell>
                  <TableCell>{bill.name}</TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => handleBillAmountClick(bill)}
                      className="font-semibold text-primary hover:underline cursor-pointer"
                    >
                      ${bill.billAmount.toLocaleString()}
                    </button>
                  </TableCell>
                  <TableCell className="text-right text-primary font-medium">
                    ${bill.paid.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-destructive font-medium">
                    ${bill.balance.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={bill.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(bill.dateCreated), 'MMM d, yyyy')}
                  </TableCell>
                </TableRow>
              ))}
              {bills.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No bills found. Create your first bill to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedBill && (
        <>
          <PaymentTrackerModal
            bill={selectedBill}
            open={trackerOpen}
            onOpenChange={setTrackerOpen}
            onAddPaymentClick={handleAddPaymentClick}
          />
          <AddPaymentModal
            bill={selectedBill}
            open={paymentOpen}
            onOpenChange={setPaymentOpen}
            onAddPayment={onAddPayment}
          />
        </>
      )}
    </>
  );
}
