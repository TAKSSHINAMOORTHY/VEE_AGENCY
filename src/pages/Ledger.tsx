import { useEffect, useState } from 'react';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { PageLayout } from '@/components/layout/PageLayout';
import { Bill } from '@/types/expense';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import { LedgerPrintLayout } from '@/components/business/LedgerPrintLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LedgerPage() {
  const navigate = useNavigate();
  const [bills] = useLocalStorageState<Bill[]>(STORAGE_KEYS.bills, []);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('TEXTILE SOLUTIONS PRIVATE LIMITED');
  const [companyAddress, setCompanyAddress] = useState(
    'Address: 123 Business Street, Mumbai, Maharashtra - 400001'
  );
  const [gstNumber, setGstNumber] = useState('GST: 27AACCT1234H1Z0');
  const [bankDetails, setBankDetails] = useState(
    'Bank: State Bank of India | Account: 1234567890 | IFSC: SBIN0001234'
  );

  useEffect(() => {
    // Load company details from localStorage if available
    const savedCompany = localStorage.getItem('textile_company_name');
    const savedAddress = localStorage.getItem('textile_company_address');
    const savedGst = localStorage.getItem('textile_gst_number');
    const savedBank = localStorage.getItem('textile_bank_details');

    if (savedCompany) setCompanyName(savedCompany);
    if (savedAddress) setCompanyAddress(savedAddress);
    if (savedGst) setGstNumber(savedGst);
    if (savedBank) setBankDetails(savedBank);

    // Set first bill as default
    if (bills.length > 0 && !selectedBillId) {
      setSelectedBillId(bills[0].id);
    }
  }, [bills, selectedBillId]);

  const selectedBill = bills.find((bill) => bill.id === selectedBillId);

  if (!selectedBill) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/business')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Ledger Statement</h1>
          </div>

          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No bills available to display ledger.</p>
            <Button onClick={() => navigate('/business')}>Go to Business Bills</Button>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/business')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Ledger Statement</h1>
        </div>

        {/* Bill Selection */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Select Bill</label>
              <Select value={selectedBillId || ''} onValueChange={setSelectedBillId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a bill" />
                </SelectTrigger>
                <SelectContent>
                  {bills.map((bill) => (
                    <SelectItem key={bill.id} value={bill.id}>
                      {bill.billNo} - {bill.name || 'Unnamed'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => window.print()} className="w-full">
                🖨️ Print Ledger
              </Button>
            </div>
          </div>
        </Card>

        {/* Ledger Display */}
        <Card className="p-0 overflow-hidden">
          <div className="bg-white">
            <LedgerPrintLayout
              bill={selectedBill}
              companyName={companyName}
              companyAddress={companyAddress}
              gstNumber={gstNumber}
              bankDetails={bankDetails}
            />
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
