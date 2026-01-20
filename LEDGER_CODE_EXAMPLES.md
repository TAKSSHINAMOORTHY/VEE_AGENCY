# Code Examples & Implementation Guide

## Example 1: Using LedgerPrintModal in BillTable

```tsx
import { LedgerPrintModal } from './LedgerPrintModal';

// In your BillTable component
export function BillTable({ bills }: BillTableProps) {
  return (
    <Table>
      <TableBody>
        {bills.map((bill) => (
          <TableRow key={bill.id}>
            <TableCell>{bill.billNo}</TableCell>
            <TableCell>₹{bill.billAmount.toLocaleString()}</TableCell>
            <TableCell>₹{bill.paid.toLocaleString()}</TableCell>
            
            {/* Print Ledger Button */}
            <TableCell>
              <LedgerPrintModal 
                bill={bill}
                companyName="TEXTILE SOLUTIONS"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## Example 2: Using LedgerPrintLayout Directly

```tsx
import { LedgerPrintLayout } from '@/components/business/LedgerPrintLayout';
import { Bill } from '@/types/expense';

export function MyCustomComponent({ bill }: { bill: Bill }) {
  return (
    <div className="p-8 bg-white">
      <LedgerPrintLayout
        bill={bill}
        companyName="YOUR COMPANY NAME"
        companyAddress="123 Business Street, City - 400001"
        gstNumber="GST: 27AACCT1234H1Z0"
        bankDetails="Bank: SBI | Account: 1234567890"
      />
    </div>
  );
}
```

---

## Example 3: Customizing Company Details in Ledger Page

```tsx
import { useState } from 'react';
import LedgerPage from '@/pages/Ledger';

// In Ledger.tsx - Initialize with company details
const [companyName, setCompanyName] = useState('TEXTILE SOLUTIONS PRIVATE LIMITED');
const [companyAddress, setCompanyAddress] = useState(
  'Address: 123 Business Street, Mumbai, Maharashtra - 400001'
);
const [gstNumber, setGstNumber] = useState('GST: 27AACCT1234H1Z0');
const [bankDetails, setBankDetails] = useState(
  'Bank: State Bank of India | Account: 1234567890 | IFSC: SBIN0001234'
);

// Save to localStorage
const saveCompanyDetails = () => {
  localStorage.setItem('textile_company_name', companyName);
  localStorage.setItem('textile_company_address', companyAddress);
  localStorage.setItem('textile_gst_number', gstNumber);
  localStorage.setItem('textile_bank_details', bankDetails);
};

// Load from localStorage
useEffect(() => {
  const saved = localStorage.getItem('textile_company_name');
  if (saved) setCompanyName(saved);
}, []);
```

---

## Example 4: Modifying Print Styles

```css
/* In src/styles/print-ledger.css */

/* Change company header color */
@media print {
  h1 {
    background-color: #1a1a1a !important;
    color: #ffffff !important;
  }

  /* Make tables more compact */
  th, td {
    padding: 4px !important;
    font-size: 10px !important;
  }

  /* Change summary card colors */
  .bg-yellow-200 {
    background-color: #cccccc !important;
  }

  /* Add page break before footer */
  footer {
    page-break-before: always;
  }
}
```

---

## Example 5: Adding Custom Calculations

```tsx
// In LedgerPrintLayout.tsx - Custom balance calculation with interest

const calculateLedgerWithInterest = (
  entries: any[],
  interestRate: number = 0.05
) => {
  let runningBalance = 0;
  let totalInterest = 0;

  return entries.map((entry) => {
    runningBalance += entry.credit - entry.debit;
    
    // Calculate simple interest
    const daysPassed = Math.floor(
      (new Date().getTime() - new Date(entry.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    const interest = (runningBalance * interestRate * daysPassed) / 365;
    totalInterest += interest;

    return {
      ...entry,
      balance: runningBalance,
      interest: interest,
      balanceWithInterest: runningBalance + totalInterest,
    };
  });
};
```

---

## Example 6: Adding Custom Columns to Transaction Table

```tsx
// In LedgerPrintLayout.tsx - Add reference/check number

<table className="w-full border-collapse text-sm">
  <thead>
    <tr className="bg-gray-300 border-2 border-black">
      <th className="border border-black px-3 py-2">DATE</th>
      <th className="border border-black px-3 py-2">REF/CHQ NO</th>
      <th className="border border-black px-3 py-2">PARTICULARS</th>
      <th className="border border-black px-3 py-2">DEBIT</th>
      <th className="border border-black px-3 py-2">CREDIT</th>
      <th className="border border-black px-3 py-2">BALANCE</th>
    </tr>
  </thead>
  <tbody>
    {ledgerWithBalance.map((entry, idx) => (
      <tr key={idx} className="border border-black">
        <td className="border border-black px-3 py-2">
          {format(new Date(entry.date), 'dd-MMM-yy')}
        </td>
        <td className="border border-black px-3 py-2">
          {entry.referenceNo || '-'}
        </td>
        <td className="border border-black px-3 py-2">
          {entry.description}
        </td>
        {/* ... rest of cells */}
      </tr>
    ))}
  </tbody>
</table>
```

---

## Example 7: Creating a Settings Form for Company Details

```tsx
// Component for editing company details

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CompanySettingsForm() {
  const [companyName, setCompanyName] = useState(
    localStorage.getItem('textile_company_name') || ''
  );
  const [companyAddress, setCompanyAddress] = useState(
    localStorage.getItem('textile_company_address') || ''
  );
  const [gstNumber, setGstNumber] = useState(
    localStorage.getItem('textile_gst_number') || ''
  );
  const [bankDetails, setBankDetails] = useState(
    localStorage.getItem('textile_bank_details') || ''
  );

  const handleSave = () => {
    localStorage.setItem('textile_company_name', companyName);
    localStorage.setItem('textile_company_address', companyAddress);
    localStorage.setItem('textile_gst_number', gstNumber);
    localStorage.setItem('textile_bank_details', bankDetails);
    alert('Company details saved!');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Company Name</label>
        <Input 
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Enter company name"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <Input 
          value={companyAddress}
          onChange={(e) => setCompanyAddress(e.target.value)}
          placeholder="Enter company address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">GST Number</label>
        <Input 
          value={gstNumber}
          onChange={(e) => setGstNumber(e.target.value)}
          placeholder="Enter GST number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Bank Details</label>
        <Input 
          value={bankDetails}
          onChange={(e) => setBankDetails(e.target.value)}
          placeholder="Enter bank details"
        />
      </div>

      <Button onClick={handleSave} className="w-full">
        Save Company Details
      </Button>
    </div>
  );
}
```

---

## Example 8: PDF Export Integration

```tsx
// Add PDF export to LedgerPrintLayout

import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function LedgerPrintLayout({ bill, ...props }) {
  const printRef = useRef<HTMLDivElement>(null);

  const exportToPDF = async () => {
    if (!printRef.current) return;

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        imgWidth,
        imgHeight
      );

      pdf.save(`ledger-${bill.billNo}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  };

  return (
    <div>
      <button onClick={exportToPDF}>Export as PDF</button>
      <div ref={printRef}>{/* Ledger content */}</div>
    </div>
  );
}
```

---

## Example 9: Batch Printing Multiple Ledgers

```tsx
// Print multiple ledgers at once

export function printMultipleLedgers(billIds: string[], bills: Bill[]) {
  billIds.forEach((billId, index) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    // Delay each print to avoid overlap
    setTimeout(() => {
      // Create temporary window
      const printWindow = window.open('', `print_${index}`, 'width=800,height=600');
      
      if (printWindow) {
        // Write ledger content to window
        printWindow.document.write(`
          <html>
            <head>
              <style>${printStyles}</style>
            </head>
            <body>
              ${ledgerHTML}
            </body>
          </html>
        `);

        printWindow.document.close();
        
        // Print after content loads
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }, index * 1000); // 1 second between each print
  });
}
```

---

## Example 10: Custom Ledger Template

```tsx
// Create an alternative ledger template

export function CustomLedgerTemplate({ bill }: { bill: Bill }) {
  return (
    <div className="print-container">
      {/* Custom header with logo */}
      <div className="header-section">
        <img src="/logo.png" alt="Logo" className="logo" />
        <h1>LEDGER STATEMENT</h1>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-8">
        <div className="left-column">
          {/* Client details */}
        </div>
        <div className="right-column">
          {/* Summary info */}
        </div>
      </div>

      {/* Extended table with more details */}
      <table className="detailed-ledger">
        <thead>
          <tr>
            <th>DATE</th>
            <th>DESCRIPTION</th>
            <th>REFERENCE</th>
            <th>DEBIT</th>
            <th>CREDIT</th>
            <th>BALANCE</th>
          </tr>
        </thead>
        <tbody>
          {/* Dynamic rows */}
        </tbody>
      </table>

      {/* Custom footer */}
      <footer className="custom-footer">
        {/* Custom content */}
      </footer>
    </div>
  );
}
```

---

## Example 11: TypeScript Interface Extensions

```tsx
// Extend the Bill interface with ledger-specific data

interface LedgerBill extends Bill {
  ledgerStartDate?: string;
  ledgerEndDate?: string;
  ledgerNotes?: string;
  ledgerReference?: string;
  previousBalance?: number;
}

interface LedgerTransaction extends Payment {
  runningBalance: number;
  referenceNumber?: string;
  category?: 'debit' | 'credit';
}

interface LedgerSummary {
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  openingBalance: number;
  totalTransactions: number;
}

// Usage in component
function LedgerPrintLayout({ bill }: { bill: LedgerBill }) {
  const summary: LedgerSummary = calculateSummary(bill);
  // ...
}
```

---

## Example 12: Print Preview Hook

```tsx
// Custom hook for print preview

import { useRef, useState } from 'react';

export function usePrintPreview(elementId: string) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const openPreview = () => {
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  const handlePrint = () => {
    if (printRef.current) {
      window.print();
    }
  };

  return {
    printRef,
    isPreviewOpen,
    openPreview,
    closePreview,
    handlePrint,
  };
}

// Usage
export function MyComponent() {
  const { printRef, isPreviewOpen, openPreview, handlePrint } = 
    usePrintPreview('ledger');

  return (
    <>
      <button onClick={openPreview}>Preview</button>
      <button onClick={handlePrint}>Print</button>
      {isPreviewOpen && (
        <div ref={printRef}>
          <LedgerPrintLayout bill={bill} />
        </div>
      )}
    </>
  );
}
```

---

## Example 13: Responsive Layout

```css
/* In print-ledger.css - Add responsive behavior */

@media print and (max-width: 1024px) {
  table {
    font-size: 9px !important;
  }

  th, td {
    padding: 4px !important;
  }
}

@media print and (max-height: 800px) {
  .print-container {
    padding: 0.25in !important;
  }

  h1 {
    font-size: 20px !important;
  }
}
```

---

## Example 14: Dark Mode Print Support

```tsx
// In LedgerPrintLayout.tsx - Support dark mode

const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

<style>{`
  @media print {
    ${isDarkMode ? `
      * {
        background-color: white !important;
        color: black !important;
      }
      h1, h2, h3 {
        color: black !important;
      }
    ` : ''}
  }
`}</style>
```

---

## Example 15: Accessibility Enhancements

```tsx
// Add ARIA labels and semantic HTML

<div
  role="table"
  aria-label="Ledger Transaction Table"
  aria-describedby="ledger-desc"
>
  <div id="ledger-desc" className="sr-only">
    Transaction table showing dates, particulars, debit, credit, and running balance
  </div>

  <table>
    <caption className="sr-only">
      Ledger account for {bill.name} from {bill.dateCreated} to today
    </caption>
    {/* Table content */}
  </table>
</div>
```

---

## Tips for Implementation

1. **Always test** before deploying
2. **Use TypeScript** for type safety
3. **Check browser support** for CSS features
4. **Keep localStorage** for company details
5. **Validate data** before rendering
6. **Handle errors** gracefully
7. **Test print** in multiple browsers
8. **Optimize images** if adding logos
9. **Consider performance** with large ledgers
10. **Document changes** for maintenance

---

## Common Patterns

### Pattern 1: Memoization
```tsx
const ledgerData = useMemo(() => 
  calculateLedger(bill.payments), 
  [bill.id]
);
```

### Pattern 2: Error Handling
```tsx
try {
  const result = calculateBalance();
} catch (error) {
  console.error('Calculation failed:', error);
  return 0;
}
```

### Pattern 3: Data Transformation
```tsx
const transactions = bill.payments
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .map(p => ({ ...p, balance: calculateBalance(p) }));
```

---

This code examples guide provides starting points for common customization tasks. Adapt as needed for your specific requirements.
