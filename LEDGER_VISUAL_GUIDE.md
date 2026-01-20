# Ledger Print Layout - Visual Guide

## A4 Page Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                      TOP MARGIN (0.5")                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │  TEXTILE SOLUTIONS PRIVATE LIMITED                │  │
│  │  Address: 123 Business Street, Mumbai             │  │
│  │  GST: 27AACCT1234H1Z0                             │  │
│  │  Bank: State Bank of India | Account: 1234567890 │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│                   LEDGER ACCOUNT                          │
│                                                           │
│  ┌──────────────────────┬──────────────────────────────┐ │
│  │ CLIENT DETAILS:      │ DATE RANGE:                  │ │
│  │ Name: XYZ Textiles   │ From: 15-Jan-2024            │ │
│  │ Invoice: BIL-001     │ To: 31-Jan-2024              │ │
│  │ Status: PENDING      │ Due Date: 14-Feb-2024        │ │
│  └──────────────────────┴──────────────────────────────┘ │
│                                                           │
│  ┌──────────┬──────────────────┬────────┬────────┬────────┐ │
│  │ DATE     │ PARTICULARS      │ DEBIT  │ CREDIT │BALANCE │ │
│  ├──────────┼──────────────────┼────────┼────────┼────────┤ │
│  │15-Jan-24 │ Bill Amount      │   -    │50000.00│50000.00│ │
│  │20-Jan-24 │ Payment Received │25000.00│  -     │25000.00│ │
│  │25-Jan-24 │ Payment Received │25000.00│  -     │  0.00  │ │
│  ├──────────┴──────────────────┼────────┼────────┼────────┤ │
│  │ TOTALS:                      │50000.00│50000.00│  0.00  │ │
│  └──────────────────────────────┴────────┴────────┴────────┘ │
│                                                           │
│  ┌────────────┬────────────┬──────────────────────┐     │
│  │ TOTAL      │ TOTAL      │ CLOSING BALANCE      │     │
│  │ DEBIT      │ CREDIT     │ (HIGHLIGHTED)        │     │
│  │ ₹50000.00  │ ₹50000.00  │ ₹0.00                │     │
│  └────────────┴────────────┴──────────────────────┘     │
│                                                           │
│  ┌─────────────────┬──────────────┬──────────────────┐  │
│  │ Authorized By   │ COMPANY      │ Received By      │  │
│  │                 │ STAMP        │                  │  │
│  │                 │ (AREA)       │                  │  │
│  │ _______________│______________│________________ │  │
│  │                 │              │                  │  │
│  └─────────────────┴──────────────┴──────────────────┘  │
│                                                           │
│  Note: This is a computer-generated ledger account       │
│  statement and does not require signature.               │
│  Terms: Payment terms as per agreement...                │
│  Printed Date: 31-Jan-2024 14:30:45                      │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                      BOTTOM MARGIN (0.5")                │
└─────────────────────────────────────────────────────────┘
```

## Component Sections

### 1. Header Section
- Company name (bold, 28px)
- Address line
- GST number
- Bank details
- All centered with border-bottom

### 2. Title
- "LEDGER ACCOUNT" centered with box styling
- Prominent and easy to identify

### 3. Client Information Block (2-column grid)
**Left Column:**
```
┌─────────────────────────────┐
│ CLIENT DETAILS:             │
│ Name: [Client Name]         │
│ Invoice No: [Bill No]       │
│ Status: [Status Badge]      │
└─────────────────────────────┘
```

**Right Column:**
```
┌─────────────────────────────┐
│ DATE RANGE:                 │
│ From: [Start Date]          │
│ To: [Current Date]          │
│ Due Date: [Due Date]        │
└─────────────────────────────┘
```

### 4. Transaction Table (5 columns)
```
┌─────────┬──────────────────┬──────────┬──────────┬──────────┐
│ DATE    │ PARTICULARS      │ DEBIT    │ CREDIT   │ BALANCE  │
│ (left)  │ (left)           │ (right)  │ (right)  │ (right)  │
├─────────┼──────────────────┼──────────┼──────────┼──────────┤
│ Entries sorted by date...                                    │
└─────────┴──────────────────┴──────────┴──────────┴──────────┘
```

**Column Details:**
- **DATE**: Format: dd-MMM-yy (e.g., 15-Jan-24)
- **PARTICULARS**: Text description (Bill Amount, Payment Received, etc.)
- **DEBIT**: Right-aligned, formatted currency (₹X,XXX.XX)
- **CREDIT**: Right-aligned, formatted currency (₹X,XXX.XX)
- **BALANCE**: Right-aligned, running total (bold)

**Table Styling:**
- Header: Gray background (RGB: 211, 211, 211)
- Borders: 1px solid black all around
- Rows: Alternating hover effect (print ignores hover)
- Footer row: Bold with gray background

### 5. Summary Cards (3-column grid)
```
┌──────────────────┬──────────────────┬──────────────────────┐
│  TOTAL DEBIT     │  TOTAL CREDIT    │ CLOSING BALANCE      │
│                  │                  │ (Yellow Background)  │
│  ₹50,000.00      │  ₹50,000.00      │ ₹0.00                │
└──────────────────┴──────────────────┴──────────────────────┘
```

**Styling:**
- 2px solid black borders
- Centered text
- Bold labels and amounts
- Closing Balance: Yellow background (#FFD700 or gray in print)
- Padding: 16px

### 6. Signature Section (3-column grid)
```
┌─────────────────────┬──────────────┬──────────────────────┐
│  Authorized By      │   STAMP      │  Received By         │
│                     │   (AREA)     │                      │
│                     │   with       │                      │
│                     │   dashed     │                      │
│  __________________ │  ___border__ │  __________________ │
│                     │              │                      │
│                     │              │                      │
└─────────────────────┴──────────────┴──────────────────────┘
```

**Styling:**
- Each box has border-top with 2px black line
- Min height: 80px
- Text centered at bottom
- Stamp area: Dashed border box
- All three areas evenly spaced

### 7. Footer Section
- Disclaimer line (italic)
- Terms and conditions
- Print timestamp
- Small font (9-11px)
- Border-top for separation

## Print Preview Checklist

### Elements Visible in Print
✓ Company header with details
✓ Ledger title
✓ Client information box
✓ Date range box
✓ All transaction rows
✓ Table borders and grid
✓ Summary cards with backgrounds
✓ Signature areas
✓ Footer text
✓ All currency formatting

### Elements Hidden in Print
✗ Print button (no-print class)
✗ Dialog controls (if using modal)
✗ Navigation menu
✗ Page scrollbars
✗ Browser UI

## Responsive Dimensions

### Print (A4)
- Page size: 210 × 297 mm
- Margins: 0.5 inch (12.7 mm) all sides
- Usable width: 185 mm
- Usable height: 272 mm
- Orientation: Portrait

### On-Screen Preview
- Max width: 1024px
- Aspect ratio: maintains A4 proportions
- Padding: 32px (print-safe area)
- Box shadow: subtle for depth

## Font and Text Specifications

### Font Family
- Primary: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- Tables: Same (monospace fallback)
- Print: Exact same for consistency

### Font Sizes
- Company name (h1): 28px / 21pt
- Ledger title (h2): 20px / 15pt
- Section headers (h3): 16px / 12pt
- Table headers (th): 11px / 8pt
- Table content (td): 11px / 8pt
- Body text (p): 11px / 8pt
- Footer: 9px / 6.75pt

### Font Weights
- Company name: 700 (bold)
- Titles: 700 (bold)
- Labels: 600 (semibold)
- Table headers: 700 (bold)
- Totals row: 700 (bold)
- Regular text: 400 (normal)

## Color Specification

### For Print
- Black: #000000 (RGB: 0, 0, 0)
- Gray (headers): #d3d3d3 (RGB: 211, 211, 211)
- Gray (text): #333333 (RGB: 51, 51, 51)
- Yellow (highlight): #e8e8e8 (RGB: 232, 232, 232) - grayscale in print

### For On-Screen
- Black: #000000
- Gray: #d3d3d3 or #e8e8e8
- Yellow: #FFD700 (highlighted box)
- White: #ffffff (background)

## Spacing Reference

### Margins & Padding
- Page margin: 0.5 inch (all sides)
- Container padding: 32px
- Section margin: 24px below
- Table margin: 12px top/bottom
- Cell padding: 8px
- Grid gap: 12-32px
- Signature area height: 80px min

### Line Heights
- Body text: 1.4
- Compact text: 1.3
- Headings: 1.2

## Example Output Dimensions

```
A4 Page:
Total: 210 × 297 mm
With margins (0.5" = 12.7mm): 184.6 × 271.6 mm

Content blocks:
- Header: ~40mm
- Title: ~8mm
- Info boxes: ~40mm
- Table: ~120mm (scales with transactions)
- Summary: ~20mm
- Signatures: ~50mm
- Footer: ~15mm
Total estimated: ~250-290mm (fits on single page)
```

## Troubleshooting Visual Issues

| Visual Issue | Cause | Fix |
|---|---|---|
| Borders too thin | Print scale too low | Increase scale to 110% |
| Text overlaps | Font size too large | Reduce font size in CSS |
| Colors appear gray | Background graphics off | Enable in print settings |
| Page breaks mid-table | Too many transactions | Reduce font size or row padding |
| Signature areas cramped | Page margins too large | Reduce margins to 0.3" |
| Company header cut off | Top margin too small | Increase to 0.75" |

This visual guide ensures the ledger prints exactly as designed with professional appearance suitable for official business records.
