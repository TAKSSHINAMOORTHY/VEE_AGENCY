# Ledger Print System - Implementation Guide

## What Was Created

I've implemented a complete print-only ledger invoice system for your textile business with the following components:

### 1. Core Components

**LedgerPrintLayout.tsx** - Main ledger rendering component that includes:
- Professional company header with GST and bank details
- Client information and date range boxes
- Transaction table with debit/credit columns
- Running balance calculations
- Summary cards (Total Debit, Total Credit, Closing Balance)
- Signature and stamp areas
- Footer with legal notes

**LedgerPrintModal.tsx** - Modal dialog wrapper that:
- Provides a "Ledger" button in the Bills table
- Opens ledger in a clean dialog interface
- Shows print button for easy printing

### 2. New Page

**Ledger.tsx** - Dedicated ledger page that:
- Allows you to select different bills
- Displays the full ledger statement
- Has a convenient print button
- Saves company details to localStorage

### 3. Styling

**print-ledger.css** - Professional print stylesheet that:
- Ensures exact color reproduction
- Sets A4 page formatting
- Optimizes table layout for printing
- Hides UI elements not needed in print
- Maintains borders and spacing

### 4. Navigation

Updated components:
- **Navbar.tsx** - Added "Ledger" link to main navigation
- **BillTable.tsx** - Added "Ledger" button to each bill row
- **App.tsx** - Added `/ledger` route

## How to Use

### Method 1: Quick Print from Bills Page

1. Navigate to **Business** page
2. Find the bill you want to print
3. Click the **Ledger** button (📄 icon) in the Actions column
4. In the dialog, click **🖨️ Print Ledger**
5. Configure your printer for A4 and print

### Method 2: Full Ledger Page

1. Click **Ledger** in the navigation menu
2. Select a bill from the dropdown
3. Click **🖨️ Print Ledger** button
4. Print to your preferred printer or save as PDF

## Ledger Features

### Transaction Table
- **DATE**: When each transaction occurred
- **PARTICULARS**: Description (Bill Amount, Payment Received, etc.)
- **DEBIT**: Payments received from client
- **CREDIT**: Bill amounts owed
- **BALANCE**: Running balance calculation

### Summary Section
Three prominently displayed boxes:
1. **TOTAL DEBIT** - Sum of all payments
2. **TOTAL CREDIT** - Sum of all bills
3. **CLOSING BALANCE** - Outstanding amount (highlighted in yellow)

### Professional Elements
- Company header with logo space
- GST and bank account information
- Client details box
- Date range specification
- Three signature areas:
  - Authorized By
  - Company Stamp (dashed border for actual stamp)
  - Received By
- Footer with terms and printed timestamp

## Customization

### Edit Company Details

**In the Ledger page component:**
```tsx
setCompanyName('YOUR TEXTILE COMPANY NAME');
setCompanyAddress('123 Your Street, City - PIN');
setGstNumber('GST: 27XXXXX1234H1Z0');
setBankDetails('Bank: XYZ Bank | Account: 12345 | IFSC: XYZ0001234');
```

**Or via browser localStorage:**
```javascript
localStorage.setItem('textile_company_name', 'YOUR COMPANY NAME');
localStorage.setItem('textile_company_address', 'YOUR ADDRESS');
localStorage.setItem('textile_gst_number', 'YOUR GST');
localStorage.setItem('textile_bank_details', 'YOUR BANK DETAILS');
```

### Adjust Print Layout

Edit `src/styles/print-ledger.css` to modify:
- Font sizes
- Colors and backgrounds
- Table spacing
- Header styling
- Signature area heights

## Print Recommendations

### Browser Print Settings
- **Format**: A4 (210 × 297 mm)
- **Orientation**: Portrait
- **Margins**: Default or Custom (0.5")
- **Scale**: 100%
- **Background Graphics**: ✓ ON (for colors)
- **Headers & Footers**: OFF

### Output
Each ledger prints on a single A4 page with clear sections and professional formatting suitable for official records.

## File Locations

```
src/
├── components/business/
│   ├── LedgerPrintLayout.tsx       ← Main ledger component
│   ├── LedgerPrintModal.tsx        ← Modal wrapper
│   └── BillTable.tsx               ← Updated with button
├── pages/
│   └── Ledger.tsx                  ← Full page view
├── styles/
│   └── print-ledger.css            ← Print styles
└── App.tsx                         ← Routes updated
```

## Data Used

The ledger automatically:
1. **Pulls bill information**: Bill number, amount, client name, status
2. **Calculates transactions**: From existing payment history
3. **Computes running balance**: Updated for each transaction
4. **Formats dates**: Using date-fns library
5. **Formats currency**: Indian Rupee (₹) format

## Integration Points

The system integrates with existing components:
- Uses `Bill` interface from your types
- Leverages existing `useLocalStorageState` hook
- Works with current payment tracking system
- Compatible with existing styling system

## Next Steps

1. **Test the feature**:
   - Create a test bill with payments
   - Open the ledger
   - Try printing

2. **Update company details**:
   - Go to Ledger page
   - Update company information
   - Test that details appear correctly

3. **Customize if needed**:
   - Modify print CSS for your brand
   - Adjust company details
   - Test with actual printer

4. **Fine-tune printing**:
   - Test print preview
   - Adjust browser print settings
   - Save company details to localStorage for future use

## Troubleshooting

**Colors not printing?**
→ Enable "Background Graphics" in print settings

**Layout looks wrong?**
→ Ensure browser scale is at 100% and page size is A4

**Missing company details?**
→ Check that company details are set in localStorage or component props

**Content overflows?**
→ This shouldn't happen as ledger is designed for single A4 page. Check page margins in print settings.

## Browser Support

- ✓ Chrome/Chromium
- ✓ Firefox
- ✓ Safari
- ✓ Edge
- ✓ Mobile browsers (with print to PDF)

Enjoy your professional ledger invoicing system!
