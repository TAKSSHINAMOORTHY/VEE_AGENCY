import { Bill } from '@/types/expense';
import { format } from 'date-fns';
import { useMemo, useRef, useState } from 'react';
import type { Company } from '@/types/company';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import '@/styles/print-ledger.css';

interface LedgerPrintLayoutProps {
  bill: Bill;
  companyName?: string;
  companyAddress?: string;
  gstNumber?: string;
  bankDetails?: string;
}

export function LedgerPrintLayout({
  bill,
  companyName = 'Vee Agency',
  companyAddress = 'Export Fabrics Mfrs\n(DUBAI Base & Domestic Soori Dhoties)\n84/1 Kaikatti Valasu, Thiruvalluvar Nagar, Villarasampatti(Post), Erode - 638107. Tamilnadu INDIA',
  gstNumber = 'GSTIN : 33ADVPV9693E1ZL',
}: LedgerPrintLayoutProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const matchedCompany = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const companyQuery = bill.name?.trim().toLowerCase();
    if (!companyQuery) return null;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.companies);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Company[];
      return (
        parsed.find((company) => company.companyName.trim().toLowerCase() === companyQuery) ?? null
      );
    } catch {
      return null;
    }
  }, [bill.name]);

  const clientCompanyName = matchedCompany?.companyName || bill.name || 'Not Specified';
  const clientCompanyGst = matchedCompany?.gstn || 'Not Specified';
  const clientCompanyAddress = matchedCompany?.address || 'Not Specified';

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  // Calculate ledger entries from payments
  const ledgerEntries = bill.payments.map((payment) => ({
    date: payment.date,
    description: payment.note || 'Payment Received',
    debit: payment.amount,
    credit: 0,
  }));

  // Add opening balance if exists
  if (bill.billAmount > 0) {
    ledgerEntries.unshift({
      date: bill.dateCreated,
      description: 'Bill Amount',
      debit: 0,
      credit: bill.billAmount,
    });
  }

  // Sort by date
  ledgerEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate running balance
  let runningBalance = 0;
  const ledgerWithBalance = ledgerEntries.map((entry) => {
    runningBalance += entry.credit - entry.debit;
    return {
      ...entry,
      balance: runningBalance,
    };
  });

  const totalDebit = ledgerEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = ledgerEntries.reduce((sum, e) => sum + e.credit, 0);
  const closingBalance = bill.billAmount - bill.paid;

  return (
    <div className="w-full min-h-screen bg-white" ref={printRef}>
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          html {
            margin: 0;
            padding: 0;
          }
          .page-break {
            page-break-after: always;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            width: 100%;
            margin: 0;
            padding: 0;
          }
        }

        @page {
          size: A4;
          margin: 0.5in;
        }
      `}</style>

      {/* Print Button - Hidden in Print */}
      <div className="no-print mb-4 flex justify-end">
        <button
          onClick={handlePrint}
          disabled={isPrinting}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isPrinting ? 'Printing...' : '🖨️ Print Ledger'}
        </button>
      </div>

      <div className="print-container p-8 max-w-4xl mx-auto">
        {/* Company Header */}
        <div className="border-b-4 border-black mb-6 pb-4">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-black">{companyName}</h1>
            <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{companyAddress}</p>
            <p className="text-sm text-gray-700">{gstNumber}</p>

          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-black border-b-2 border-black pb-2 inline-block px-4">
            LEDGER ACCOUNT
          </h2>
        </div>

        {/* Client Information Section */}
        <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
          <div className="border border-black p-4">
            <p className="font-bold text-black mb-2">CLIENT DETAILS:</p>
            <p className="text-black">
              <span className="font-semibold">Company Name:</span> {clientCompanyName}
            </p>
            <p className="text-black">
              <span className="font-semibold">GST Number:</span> {clientCompanyGst}
            </p>
            <p className="text-black whitespace-pre-line">
              <span className="font-semibold">Address:</span> {clientCompanyAddress}
            </p>
            <p className="text-black">
              <span className="font-semibold">Status:</span> <span className="font-bold uppercase">{bill.status}</span>
            </p>
          </div>
          <div className="space-y-3">
            <div className="border border-black p-4">
              <p className="font-bold text-black mb-2">DATE RANGE:</p>
              <p className="text-black">
                <span className="font-semibold">From:</span> {format(new Date(bill.dateCreated), 'dd-MMM-yyyy')}
              </p>
              <p className="text-black">
                <span className="font-semibold">To:</span> {format(new Date(), 'dd-MMM-yyyy')}
              </p>
              <p className="text-black">
                <span className="font-semibold">Due Date:</span> {format(new Date(bill.dueDate), 'dd-MMM-yyyy')}
              </p>
            </div>
            <div className="border border-black p-4">
              <p className="text-black">
                <span className="font-semibold">Invoice No:</span> {bill.billNo}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="mb-8">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-300 border-2 border-black">
                <th className="border border-black px-3 py-2 text-left font-bold text-black">DATE</th>
                <th className="border border-black px-3 py-2 text-left font-bold text-black">PARTICULARS</th>
                <th className="border border-black px-3 py-2 text-right font-bold text-black">DEBIT</th>
                <th className="border border-black px-3 py-2 text-right font-bold text-black">CREDIT</th>
                <th className="border border-black px-3 py-2 text-right font-bold text-black">BALANCE</th>
              </tr>
            </thead>
            <tbody>
              {ledgerWithBalance.map((entry, idx) => (
                <tr key={idx} className="border border-black hover:bg-gray-50">
                  <td className="border border-black px-3 py-2 text-black">
                    {format(new Date(entry.date), 'dd-MMM-yy')}
                  </td>
                  <td className="border border-black px-3 py-2 text-black font-medium">{entry.description}</td>
                  <td className="border border-black px-3 py-2 text-right text-black">
                    {entry.debit > 0 ? `₹${entry.debit.toFixed(2)}` : '-'}
                  </td>
                  <td className="border border-black px-3 py-2 text-right text-black">
                    {entry.credit > 0 ? `₹${entry.credit.toFixed(2)}` : '-'}
                  </td>
                  <td className="border border-black px-3 py-2 text-right text-black font-bold">
                    ₹{entry.balance.toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-200 border-2 border-black font-bold">
                <td colSpan={2} className="border border-black px-3 py-2 text-right text-black">
                  TOTALS:
                </td>
                <td className="border border-black px-3 py-2 text-right text-black">₹{totalDebit.toFixed(2)}</td>
                <td className="border border-black px-3 py-2 text-right text-black">₹{totalCredit.toFixed(2)}</td>
                <td className="border border-black px-3 py-2 text-right text-black">₹{closingBalance.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="border-2 border-black p-4 text-center">
            <p className="text-xs font-bold text-black mb-2">TOTAL DEBIT</p>
            <p className="text-2xl font-bold text-black">₹{totalDebit.toFixed(2)}</p>
          </div>
          <div className="border-2 border-black p-4 text-center">
            <p className="text-xs font-bold text-black mb-2">TOTAL CREDIT</p>
            <p className="text-2xl font-bold text-black">₹{totalCredit.toFixed(2)}</p>
          </div>
          <div className="border-2 border-black bg-yellow-200 p-4 text-center">
            <p className="text-xs font-bold text-black mb-2">CLOSING BALANCE</p>
            <p className="text-2xl font-bold text-black">₹{closingBalance.toFixed(2)}</p>
          </div>
        </div>

        {/* Signature and Stamp Section */}
        <div className="grid grid-cols-3 gap-12 mt-12">
          {/* Signature Space 1 */}
          <div className="text-center">
            <div className="border-t-2 border-black pt-2" style={{ height: '80px' }}>
              <p className="text-xs text-gray-600 mt-2">Authorized By</p>
            </div>
          </div>

          {/* Stamp Space */}
          <div className="text-center border-2 border-dashed border-black p-4 flex items-center justify-center">
            <p className="text-sm font-bold text-gray-400">STAMP</p>
          </div>

          {/* Signature Space 2 */}
          <div className="text-center">
            <div className="border-t-2 border-black pt-2" style={{ height: '80px' }}>
              <p className="text-xs text-gray-600 mt-2">Received By</p>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="mt-8 text-xs text-gray-600 border-t-2 border-black pt-4">
          <p className="mb-1">
            <span className="font-bold">Note:</span> This is a computer-generated ledger account statement and does not
            require signature.
          </p>
          <p className="mb-1">
            <span className="font-bold">Terms:</span> Payment terms as per agreement. Interest will be charged on
            outstanding balance as per agreement.
          </p>
          <p>
            <span className="font-bold">Printed Date:</span> {format(new Date(), 'dd-MMM-yyyy HH:mm:ss')}
          </p>
        </div>
      </div>
    </div>
  );
}
