# Ledger Print System - Advanced Customization Guide

## Styling Customization

### 1. Change Header Colors

Edit `src/styles/print-ledger.css`:

```css
/* Yellow background header - change to your color */
.bg-yellow-200 {
  background-color: #FFD700 !important; /* Gold */
}

/* Or any other color */
.bg-yellow-200 {
  background-color: #E8F4F8 !important; /* Light blue */
}
```

### 2. Modify Table Appearance

```css
/* Table header color */
th {
  background-color: #1a1a1a !important;  /* Dark background */
  color: #ffffff !important;              /* White text */
  font-weight: 700;
}

/* Alternate row colors */
tbody tr:nth-child(even) {
  background-color: #f9f9f9 !important;
}
```

### 3. Change Font Styling

```css
/* Company name */
h1 {
  font-family: 'Garamond', serif !important;
  font-size: 32px !important;
  letter-spacing: 1px !important;
}

/* Table content */
table {
  font-family: 'Courier New', monospace !important;
  font-size: 10px !important;
}
```

### 4. Adjust Spacing and Margins

```css
@page {
  size: A4;
  margin: 1in;  /* Change from 0.5in to 1in */
}

.print-container {
  padding: 1.5in;  /* Adjust container padding */
}
```

## Component Customization

### 1. Modify Ledger Layout

Edit `src/components/business/LedgerPrintLayout.tsx`:

```tsx
// Change grid layout for client details
<div className="grid grid-cols-3 gap-8 mb-6 text-sm">
  {/* Now displays in 3 columns instead of 2 */}
</div>

// Change summary card colors
<div className="border-2 border-black bg-blue-100 p-4 text-center">
  {/* Custom background color */}
</div>
```

### 2. Add Custom Logo

```tsx
// In LedgerPrintLayout.tsx, add after company name
<div className="text-center mb-4">
  <img 
    src="/logo.png" 
    alt="Company Logo" 
    className="w-16 h-16 mx-auto mb-2"
  />
  <h1 className="text-3xl font-bold text-black">{companyName}</h1>
</div>
```

### 3. Customize Signature Section

```tsx
// Modify signature area layout
<div className="grid grid-cols-4 gap-8 mt-12">
  {/* Add more signature fields */}
  <div className="text-center">
    <div className="border-t-2 border-black pt-2" style={{ height: '100px' }}>
      <p className="text-xs text-gray-600 mt-2">Finance Manager</p>
    </div>
  </div>
</div>
```

### 4. Add Company Seal/Watermark

```tsx
// In LedgerPrintLayout.tsx
<div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none">
  <div className="text-6xl font-bold text-gray-400 transform -rotate-45">
    CONFIDENTIAL
  </div>
</div>
```

## Transaction Calculation Customization

### 1. Filter Transactions by Date Range

```tsx
// In LedgerPrintLayout.tsx
const ledgerEntries = bill.payments
  .filter(payment => {
    const paymentDate = new Date(payment.date);
    const startDate = new Date(bill.dateCreated);
    const endDate = new Date();
    return paymentDate >= startDate && paymentDate <= endDate;
  })
  .map((payment) => ({
    date: payment.date,
    description: payment.note || 'Payment Received',
    debit: payment.amount,
    credit: 0,
  }));
```

### 2. Custom Balance Calculation

```tsx
// Apply interest or fees
const ledgerWithBalance = ledgerEntries.map((entry, idx) => {
  runningBalance += entry.credit - entry.debit;
  
  // Apply 2% monthly interest
  const monthsPassed = Math.floor(idx / 30);
  const interest = runningBalance * 0.02 * monthsPassed;
  
  return {
    ...entry,
    balance: runningBalance + interest,
  };
});
```

### 3. Add Transaction Categories

```tsx
const ledgerEntries = bill.payments.map((payment) => ({
  date: payment.date,
  description: payment.note || 'Payment Received',
  debit: payment.amount,
  credit: 0,
  category: payment.note?.includes('Discount') ? 'Discount' : 'Payment', // Add category
}));
```

## Advanced Print Styles

### 1. Multi-Page Ledger Support

Add to `print-ledger.css`:

```css
/* Page breaks after 15 transactions */
tbody tr:nth-child(15n) {
  page-break-after: always;
}

/* Different styling for first page */
.page-1 {
  background-color: #f5f5f5 !important;
}
```

### 2. Color-Coded Transaction Types

```css
/* Debit transactions (payments) - green */
.transaction-debit {
  background-color: #e8f5e9 !important;
}

/* Credit transactions (bills) - red */
.transaction-credit {
  background-color: #ffebee !important;
}
```

### 3. Professional Borders and Lines

```css
/* Add decorative borders */
.print-container {
  border: 3px solid #333 !important;
  border-radius: 0 !important;
}

/* Double line separators */
.separator {
  border-top: 3px double #000 !important;
  margin: 12px 0;
}
```

## Company Details Customization

### 1. Create Settings Page Integration

```tsx
// In Ledger.tsx or Settings.tsx
const [companySettings, setCompanySettings] = useState({
  name: 'TEXTILE SOLUTIONS PRIVATE LIMITED',
  address: 'Address: 123 Business Street, Mumbai, Maharashtra - 400001',
  gst: 'GST: 27AACCT1234H1Z0',
  bank: 'Bank: State Bank of India | Account: 1234567890 | IFSC: SBIN0001234',
  email: 'info@textiles.com',
  phone: '+91 XXXXX XXXXX',
  website: 'www.textiles.com',
  registrationNumber: 'CIN: U17299MH2020PTC123456',
});

const saveCompanySettings = () => {
  Object.entries(companySettings).forEach(([key, value]) => {
    localStorage.setItem(`textile_${key}`, value);
  });
};
```

### 2. Dynamic Company Details

```tsx
// In LedgerPrintLayout.tsx
const getCompanyDetails = () => {
  const details = {
    name: localStorage.getItem('textile_name') || 'TEXTILE SOLUTIONS',
    address: localStorage.getItem('textile_address') || 'Address: Unknown',
    gst: localStorage.getItem('textile_gst') || 'GST: Not Provided',
    bank: localStorage.getItem('textile_bank') || 'Bank: Not Provided',
  };
  return details;
};
```

## Export and Integration Options

### 1. Add PDF Export Button

```tsx
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const exportToPDF = async () => {
  const canvas = await html2canvas(printRef.current);
  const pdf = new jsPDF('p', 'mm', 'a4');
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
  pdf.save(`ledger-${bill.billNo}.pdf`);
};
```

### 2. Add Email Integration

```tsx
const emailLedger = async () => {
  const canvas = await html2canvas(printRef.current);
  const imageData = canvas.toDataURL('image/png');
  
  // Send via backend
  await fetch('/api/send-ledger', {
    method: 'POST',
    body: JSON.stringify({
      to: bill.clientEmail,
      billNumber: bill.billNo,
      attachment: imageData,
    }),
  });
};
```

### 3. Batch Print Multiple Ledgers

```tsx
const printMultipleLedgers = (billIds: string[]) => {
  billIds.forEach((billId, index) => {
    const bill = bills.find(b => b.id === billId);
    // Print each ledger
    setTimeout(() => {
      window.open(`/ledger?billId=${billId}`, `_blank_${index}`);
    }, index * 1000);
  });
};
```

## Template Variations

### 1. Minimal Template

```tsx
// Simplified version
<div className="print-container">
  <h1>{companyName}</h1>
  <table>
    {/* Simplified table structure */}
  </table>
  <p>Closing Balance: ₹{closingBalance}</p>
</div>
```

### 2. Detailed Template with Notes

```tsx
// Add transaction notes section
<div className="mt-8 border-t-2 border-black pt-4">
  <h3 className="font-bold mb-2">TRANSACTION NOTES:</h3>
  <p className="text-sm">{getTransactionNotes()}</p>
</div>
```

### 3. GST Invoice Template

```tsx
// Add GST breakdown
<div className="grid grid-cols-2 gap-4 my-4">
  <div>
    <p>Subtotal: ₹{subtotal}</p>
    <p>CGST (9%): ₹{cgst}</p>
    <p>SGST (9%): ₹{sgst}</p>
    <p className="font-bold">Total: ₹{total}</p>
  </div>
</div>
```

## Performance Optimization

### 1. Lazy Load Large Ledgers

```tsx
const [pageNumber, setPageNumber] = useState(1);
const itemsPerPage = 30;

const paginatedLedger = ledgerWithBalance.slice(
  (pageNumber - 1) * itemsPerPage,
  pageNumber * itemsPerPage
);
```

### 2. Memoize Calculations

```tsx
const ledgerWithBalance = useMemo(() => {
  // Heavy calculation
  return calculateLedger(ledgerEntries);
}, [bill.id, bill.payments]);
```

### 3. Optimize Print Size

```css
@media print {
  /* Reduce font sizes for compact printing */
  table {
    font-size: 9px !important;
  }
  
  td, th {
    padding: 4px !important;
  }
}
```

## Testing Checklist

- [ ] Print colors appear correctly
- [ ] All borders visible
- [ ] Text is readable
- [ ] Tables don't overflow
- [ ] Signature areas have space
- [ ] Company details are correct
- [ ] Date calculations are accurate
- [ ] Balance calculations are correct
- [ ] Print layout fits on single A4 page
- [ ] PDF export works (if added)
- [ ] Mobile print works
- [ ] Different browsers tested

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Colors not printing | Enable background graphics in print settings |
| Layout broken | Check A4 size, reduce margins |
| Text too small | Increase font size in CSS, adjust scale in print settings |
| Missing details | Verify localStorage values are set |
| Table overflows | Reduce cell padding, decrease font size |
| Signature areas missing | Ensure page size is A4 in print preview |

This guide provides extensive customization options to make the ledger system work perfectly for your textile business needs!
