# Ledger Print System - Quick Reference Card

## 🖨️ How to Print a Ledger Invoice

### 2-Minute Quick Start

**Step 1:** Go to Business page → Find your bill

**Step 2:** Click the "Ledger" button (📄 icon) on the bill row

**Step 3:** Click "🖨️ Print Ledger" in the dialog

**Step 4:** Click "Print" in your browser's print dialog

**Done!** Your professional A4 ledger invoice is printing.

---

## Alternative Method: Dedicated Ledger Page

1. Click **Ledger** in the top menu
2. Select bill from dropdown
3. Click **🖨️ Print Ledger** button
4. Print

---

## What's on the Ledger?

```
📋 HEADER
   ├─ Company name and details
   ├─ GST number
   └─ Bank account information

👤 CLIENT INFO
   ├─ Client name and invoice number
   ├─ Bill status (Paid/Pending)
   ├─ Date range
   └─ Due date

📊 TRANSACTION TABLE
   ├─ Date of each transaction
   ├─ Description
   ├─ Debit (payments received)
   ├─ Credit (bill amounts)
   └─ Running balance

💰 SUMMARY
   ├─ Total paid
   ├─ Total billed
   └─ Balance due (highlighted)

✍️ SIGNATURES
   ├─ Authorized by line
   ├─ Company stamp area
   └─ Received by line
```

---

## Print Tips

### Best Results

✓ **Format:** A4 (standard paper)
✓ **Orientation:** Portrait
✓ **Scale:** 100%
✓ **Colors:** Enable "Background graphics"
✓ **Margins:** Default (0.5 inches)

### Browser Settings

**Chrome/Edge:**
1. Ctrl+P or ⌘+P to print
2. Destination → Your printer
3. Paper size → A4
4. Background graphics → Enabled
5. Click Print

**Firefox:**
1. Ctrl+P or ⌘+P
2. Paper → A4
3. Margins → Default
4. Print backgrounds → Checked
5. Click Print

---

## Common Questions

### Q: Why doesn't my color print?
**A:** Check "Background graphics" or "Print backgrounds" in your print settings.

### Q: How do I save as PDF?
**A:** Select "Print to PDF" or "Save as PDF" as your printer in the print dialog.

### Q: Can I print multiple ledgers at once?
**A:** Not yet, but you can print each individually. Check the Advanced Guide for batch printing instructions.

### Q: Why does the ledger look different on screen vs print?
**A:** Print CSS optimizes it for paper. The on-screen preview shows what will print.

### Q: Can I modify company details?
**A:** Yes! See the Setup Guide or ask your admin for customization.

---

## File Locations & Access

| Feature | Location |
|---------|----------|
| Print Ledger Button | Business page, Actions column |
| Ledger Page | Menu → Ledger (or /ledger) |
| Help Documentation | See LEDGER_SETUP.md |
| Advanced Options | See LEDGER_ADVANCED.md |

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Print Dialog | Ctrl+P (Windows) / ⌘+P (Mac) |
| Print | Enter / Return |
| Close Print Dialog | Esc |
| Save as PDF | Ctrl+S in print preview |

---

## Print Quality Checklist

Before printing officially, verify:

- [ ] Company name is correct
- [ ] Client name is correct
- [ ] All transactions show correctly
- [ ] Balance calculation looks right
- [ ] All borders are visible
- [ ] Text is readable
- [ ] Colors/highlights appear
- [ ] Signature areas have space
- [ ] Print preview looks good
- [ ] Paper size is A4

---

## Troubleshooting Guide

### Problem: Nothing prints
**Solutions:**
1. Check printer is on and connected
2. Try "Print to PDF" first
3. Refresh the page and try again

### Problem: Text looks blurry
**Solutions:**
1. Increase print scale to 110% or 125%
2. Check your printer driver is up to date
3. Try a different printer if available

### Problem: Page breaks in wrong place
**Solutions:**
1. This shouldn't happen - fits on 1 page
2. If it does, reduce browser zoom to 90%
3. Check your print margin settings

### Problem: Colors print as gray
**Solutions:**
1. Enable "Background graphics" in print dialog
2. Try different browser
3. Check printer color settings

### Problem: Details are missing
**Solutions:**
1. Scroll left/right to see all content
2. Check if bill has complete information
3. Verify transactions are loaded

---

## Support

### For Technical Help
- Check LEDGER_SETUP.md for setup issues
- Check LEDGER_ADVANCED.md for customization
- Check LEDGER_VISUAL_GUIDE.md for layout details

### For Business Questions
- Contact your company administrator
- Ask about company details customization
- Inquire about batch printing options

---

## What's Included in the Invoice

✅ Professional company header
✅ Client and date information  
✅ All payment history
✅ Running balance calculations
✅ Signature and stamp areas
✅ Legal terms and conditions
✅ Print timestamp
✅ Bank account details
✅ GST number
✅ Professional formatting (A4)

---

## Available in

- ✓ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✓ Desktop computers
- ✓ Tablets (via print to PDF)
- ✓ Mobile (via print to PDF)
- ✓ All operating systems

---

## Sample Ledger Output

```
════════════════════════════════════════════════════════════
         TEXTILE SOLUTIONS PRIVATE LIMITED
    Address: 123 Business Street, Mumbai - 400001
        GST: 27AACCT1234H1Z0
   Bank: State Bank | Account: 1234567890 | IFSC: SBIN0001234
════════════════════════════════════════════════════════════

                    LEDGER ACCOUNT

┌─────────────────────────┬─────────────────────────┐
│ CLIENT DETAILS:         │ DATE RANGE:             │
│ Name: ABC Textiles Inc  │ From: 15-Jan-2024       │
│ Invoice: BIL-001        │ To: 31-Jan-2024         │
│ Status: PAID            │ Due Date: 14-Feb-2024   │
└─────────────────────────┴─────────────────────────┘

┌─────────┬──────────────────┬───────────┬───────────┬─────────┐
│ DATE    │ PARTICULARS      │ DEBIT     │ CREDIT    │ BALANCE │
├─────────┼──────────────────┼───────────┼───────────┼─────────┤
│15-Jan   │ Bill Amount      │   -       │50000.00   │50000.00 │
│20-Jan   │ Payment Received │25000.00   │   -       │25000.00 │
│25-Jan   │ Payment Received │25000.00   │   -       │   0.00  │
├─────────┴──────────────────┼───────────┼───────────┼─────────┤
│ TOTALS:                    │50000.00   │50000.00   │   0.00  │
└────────────────────────────┴───────────┴───────────┴─────────┘

║ TOTAL DEBIT: ₹50000.00 │ TOTAL CREDIT: ₹50000.00 │ DUE: ₹0.00 ║

[Authorized By]          [STAMP AREA]          [Received By]
_________________      _______________      _________________

Note: Computer-generated ledger. Printed: 31-Jan-2024 14:30
════════════════════════════════════════════════════════════
```

---

## Tips for Professional Printing

1. **Use quality paper** - Regular white A4 is standard
2. **Use quality ink** - Ensures text clarity
3. **Test before bulk printing** - Print one to verify
4. **Keep margins consistent** - Use default 0.5"
5. **Store printed copies** - Keep in organized files
6. **Digital backup** - Save PDF copies too

---

## Version Info

- **System:** Ledger Print System v1.0
- **Compatible:** Textile Business Module
- **Updated:** January 2024
- **Format:** A4 Portrait

---

## Next Steps

1. ✅ Print your first ledger invoice
2. 📧 Email it to clients if needed
3. 💾 Save as PDF for records
4. 📁 File in your documentation system
5. 🎨 Customize company details if needed

**Enjoy your professional ledger invoicing system!**

For questions or issues, refer to the detailed documentation files or contact support.
