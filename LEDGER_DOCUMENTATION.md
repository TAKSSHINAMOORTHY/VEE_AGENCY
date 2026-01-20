# Print-Only Ledger Invoice System

## Overview

The ledger invoice system provides a professional, print-ready A4 accounting statement for textile business invoices. It includes all essential elements of a traditional accounting ledger with debit/credit columns, running balance, and signature/stamp areas.

## Features

### 1. **LedgerPrintLayout Component** (`src/components/business/LedgerPrintLayout.tsx`)

The main component that renders the ledger statement with:

- **Company Header**: Customizable company name, address, GST number, and bank details
- **Client Information**: Bill number, client name, and status
- **Date Range**: From and to dates for the ledger period
- **Transaction Table**: 
  - Date column
  - Particulars/Description column
  - Debit amounts (payments received)
  - Credit amounts (bill amounts)
  - Running balance calculation
- **Summary Section**: Total debit, total credit, and closing balance
- **Signature Areas**: Three designated signature zones (Authorized By, Stamp, Received By)
- **Footer Notes**: Standard terms and conditions

### 2. **LedgerPrintModal Component** (`src/components/business/LedgerPrintModal.tsx`)

A modal dialog that:

- Provides a button to open the ledger in a dialog
- Displays the ledger with print styling
- Can be triggered from the Bills table

### 3. **Ledger Page** (`src/pages/Ledger.tsx`)

A dedicated full-page view that:

- Allows selection of different bills
- Displays the selected bill's ledger statement
- Provides a print button for direct printing
- Loads company details from localStorage

### 4. **Print CSS** (`src/styles/print-ledger.css`)

Comprehensive print stylesheets that:

- Ensure exact color reproduction (no color adjustments)
- Set A4 page dimensions with proper margins
- Format tables for printing
- Hide UI elements not needed in print
- Ensure proper text alignment and spacing
- Maintain borders and backgrounds exactly

## Usage

### Option 1: Print from Business Bills Page

1. Go to **Business** page
2. Find the bill you want to print
3. Click the **Ledger** button (printer icon) in the Actions column
4. Click **Print Ledger** in the dialog
5. Configure print settings (already formatted for A4)
6. Print

### Option 2: Print from Dedicated Ledger Page

1. Click **Ledger** in the main navigation
2. Select the desired bill from the dropdown
3. Click **Print Ledger** button
4. Configure print settings and print

## Ledger Components Breakdown

### Company Header Section
```
TEXTILE SOLUTIONS PRIVATE LIMITED
Address: 123 Business Street, Mumbai, Maharashtra - 400001
GST: 27AACCT1234H1Z0
Bank: State Bank of India | Account: 1234567890 | IFSC: SBIN0001234
```

### Client Details & Date Range
- **Left Box**: Client name, invoice number, status
- **Right Box**: Date range and due date

### Transaction Table
| DATE | PARTICULARS | DEBIT | CREDIT | BALANCE |
|------|-------------|-------|--------|---------|
| 15-Jan-24 | Bill Amount | - | ₹50,000.00 | ₹50,000.00 |
| 20-Jan-24 | Payment Received | ₹25,000.00 | - | ₹25,000.00 |
| 25-Jan-24 | Payment Received | ₹25,000.00 | - | ₹0.00 |

### Summary Cards
Three highlighted boxes showing:
- **Total Debit**: Sum of all payments
- **Total Credit**: Sum of all bill amounts
- **Closing Balance**: Outstanding amount

### Signature Section
Three areas for:
1. Authorized By (signature)
2. Company Stamp (dashed border box)
3. Received By (signature)

### Footer
- Standard disclaimer about computer-generated statement
- Payment terms and conditions
- Print timestamp

## Customization

### Company Details

Edit company details in three ways:

1. **In Ledger Page**:
   ```tsx
   setCompanyName('YOUR COMPANY NAME');
   setCompanyAddress('YOUR ADDRESS');
   setGstNumber('YOUR GST NUMBER');
   setBankDetails('YOUR BANK DETAILS');
   ```

2. **Via localStorage**:
   ```javascript
   localStorage.setItem('textile_company_name', 'YOUR COMPANY NAME');
   localStorage.setItem('textile_company_address', 'YOUR ADDRESS');
   localStorage.setItem('textile_gst_number', 'YOUR GST NUMBER');
   localStorage.setItem('textile_bank_details', 'YOUR BANK DETAILS');
   ```

3. **Direct in component props** when using `LedgerPrintModal`:
   ```tsx
   <LedgerPrintModal 
     bill={bill}
     companyName="YOUR COMPANY NAME"
     companyAddress="YOUR ADDRESS"
     gstNumber="YOUR GST NUMBER"
     bankDetails="YOUR BANK DETAILS"
   />
   ```

### Print Styles

Modify `src/styles/print-ledger.css` to customize:
- Font sizes and families
- Colors and backgrounds
- Spacing and margins
- Page size and orientation
- Table styling

## Print Settings Recommendations

### Browser Print Dialog

1. **Format**: A4 (210 × 297 mm)
2. **Orientation**: Portrait
3. **Margins**: Default (0.5 inches)
4. **Scale**: 100%
5. **Background graphics**: ON (for colored boxes)
6. **Repeat headers**: ON

### Expected Output

Each ledger prints on a single A4 page with:
- Clear borders and table structure
- Professional formatting
- Readable font sizes
- Signature and stamp areas
- All financial details visible

## Data Flow

```
Bill (with payments) 
    ↓
LedgerPrintLayout (calculates balance)
    ↓
Transaction Table (sorted by date)
    ↓
Summary Calculations
    ↓
Print CSS (A4 formatting)
    ↓
PDF/Print Output
```

## Integration with Business Module

The ledger system integrates seamlessly with the existing Business Bills module:

1. **Bills Table**: Shows all bills with a new "Ledger" action button
2. **Payment Tracking**: Uses existing payment history to generate ledger
3. **Date Calculations**: Automatically calculates running balances
4. **Status Display**: Shows bill status in the ledger header

## Technical Details

### Dependencies

- `date-fns`: Date formatting and calculations
- React UI components from shadcn/ui
- Lucide icons for UI elements

### File Structure

```
src/
├── components/
│   └── business/
│       ├── LedgerPrintLayout.tsx       # Main ledger display
│       ├── LedgerPrintModal.tsx        # Modal wrapper
│       └── BillTable.tsx               # Updated with ledger button
├── pages/
│   └── Ledger.tsx                      # Dedicated ledger page
├── styles/
│   └── print-ledger.css                # Print styling
└── App.tsx                             # Updated with ledger route
```

### Component Props

#### LedgerPrintLayout

```typescript
interface LedgerPrintLayoutProps {
  bill: Bill;
  companyName?: string;
  companyAddress?: string;
  gstNumber?: string;
  bankDetails?: string;
}
```

#### LedgerPrintModal

```typescript
interface LedgerPrintModalProps {
  bill: Bill;
  companyName?: string;
  companyAddress?: string;
  gstNumber?: string;
  bankDetails?: string;
  onClose?: () => void;
}
```

## Troubleshooting

### Print Colors Not Showing

**Issue**: Background colors or borders not visible in print  
**Solution**: Ensure "Background graphics" is checked in browser print settings

### Layout Breaks Across Pages

**Issue**: Content spans multiple pages  
**Solution**: This is intentional - each ledger is a single page. Check A4 page size in settings

### Text Appears Small or Unreadable

**Issue**: Font sizes too small  
**Solution**: Increase print scale in browser print dialog (e.g., 110% or 125%)

### Missing Company Details

**Issue**: Company name/GST not showing  
**Solution**: Check localStorage values or pass props to component

## Browser Compatibility

Works with all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Future Enhancements

Potential additions:
- Multiple ledger entries per page
- Custom logo in header
- Additional transaction filters
- Export to PDF functionality
- Email integration
- Batch printing
- Ledger templates for different business types
