import { useState } from 'react';
import { Bill } from '@/types/expense';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LedgerPrintLayout } from './LedgerPrintLayout';
import { Printer } from 'lucide-react';

interface LedgerPrintModalProps {
  bill: Bill;
  companyName?: string;
  companyAddress?: string;
  gstNumber?: string;
  bankDetails?: string;
  onClose?: () => void;
}

export function LedgerPrintModal({
  bill,
  companyName,
  companyAddress,
  gstNumber,
  bankDetails,
  onClose,
}: LedgerPrintModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      onClose?.();
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Printer className="w-4 h-4" />
        <span className="hidden sm:inline">Ledger</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ledger Account Statement</DialogTitle>
            <DialogDescription>Print-ready ledger for {bill.billNo}</DialogDescription>
          </DialogHeader>

          <div className="w-full">
            <LedgerPrintLayout
              bill={bill}
              companyName={companyName}
              companyAddress={companyAddress}
              gstNumber={gstNumber}
              bankDetails={bankDetails}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
