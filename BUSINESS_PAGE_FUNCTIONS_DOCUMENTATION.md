# Business Page Documentation - VEE Agency

## 1. Purpose of the Business Page

The Business page is the main operational screen for business billing and collection tracking. It is designed to answer three practical questions quickly:

1. How many business bills are recorded?
2. How much amount has been paid so far?
3. How much balance is still outstanding?

Beyond summary visibility, the page supports full day-to-day actions:

1. Add new bills.
2. Add payment entries against each bill.
3. Edit existing payment entries.
4. Delete incorrect payment entries.
5. Keep bill status and balance automatically accurate.
6. Open ledger print view for each bill.

In short, this page is both a dashboard and an operations console for business receivables.

---

## 2. Where the Business Page is Implemented

Primary file:

- `src/pages/Business.tsx`

Supporting components used by this page:

- `src/components/business/AddBillModal.tsx`
- `src/components/business/BillTable.tsx`
- `src/components/common/SummaryCard.tsx`
- `src/components/common/ExportButtons.tsx`

Data dependencies:

- `src/hooks/useLocalStorageState.ts`
- `src/lib/storageKeys.ts`
- `src/lib/id.ts`
- `src/types/expense.ts`

---

## 3. High-Level Page Structure

The Business page UI is arranged in three major sections:

1. Header section
- Page title and subtitle
- Action buttons: Export and Add Bill

2. Summary cards section
- Total Bills
- Total Paid
- Outstanding
- Completion Rate

3. Bills table section
- Full list of bills
- Expandable payment log per bill
- Add/Edit/Delete payment actions
- Ledger print trigger per bill

This structure keeps global metrics visible at top and detailed record management below.

---

## 4. Data Source and Persistence

The page stores and reads business data from local storage using the custom hook `useLocalStorageState`.

Storage key used:

- `expense-compass:bills`

This gives persistent data behavior without backend dependency:

1. Bills remain available after app restart.
2. UI updates immediately when any bill/payment changes.
3. The page can restore and continue operational state quickly.

---

## 5. Core Business Logic Functions in Business.tsx

## 5.1 normalizeBill(bill)

This is a key internal function used throughout updates.

Responsibilities:

1. Calculates `balance = max(0, billAmount - paid)`.
2. Ensures due date exists:
- If due date is missing, it auto-generates due date as 30 days after dateCreated.
3. Sets status automatically:
- `paid` when balance is 0.
- `pending` otherwise.

Why this matters:

- It keeps all bill records internally consistent, even if older records are incomplete or stale.

## 5.2 Legacy Data Migration via useEffect

Business page runs a migration check each render cycle for bill list changes.

What it does:

1. Compares current stored bills with normalized versions.
2. Detects mismatches in status or balance.
3. Rewrites storage with normalized bills when needed.

Why this matters:

- Prevents old or manually altered records from breaking summary accuracy.

## 5.3 handleAddBill(billData)

Creates a new bill entry.

Steps:

1. Computes due date (30 days from dateCreated).
2. Builds a full `Bill` object with:
- new id
- paid = 0
- balance = bill amount
- status = pending
- empty payment list
3. Adds the new bill at top of list.
4. Stores the bill id as `openBillId` so table can auto-expand that row.

Why this matters:

- New bills become immediately visible and ready for payment operations.

## 5.4 handleAddPayment(billId, amount, date, note)

Adds a payment transaction to one specific bill.

Steps:

1. Finds target bill by id.
2. Appends payment object in bill.payments.
3. Increases bill.paid by payment amount.
4. Re-normalizes bill using `normalizeBill`.

Result:

- Balance and status update automatically.

## 5.5 handleUpdatePayment(billId, paymentId, updates)

Edits one payment row for a bill.

Steps:

1. Finds target bill.
2. Replaces the matching payment with new values.
3. Recomputes total paid from full payment list.
4. Re-normalizes bill.

Why this matters:

- Ensures corrected payment values are reflected consistently in totals.

## 5.6 handleDeletePayment(billId, paymentId)

Deletes one payment row.

Steps:

1. Finds target bill.
2. Removes chosen payment.
3. Recomputes paid amount from remaining payments.
4. Re-normalizes bill.

Why this matters:

- Removing wrong entries remains safe and consistent.

## 5.7 handleUpdateBill(billId, updates)

Updates bill amount and optionally paid amount directly.

Behavior:

1. If paidAmount is not provided, keeps existing payment log.
2. If paidAmount is provided:
- if set to 0, clears payments
- otherwise creates one synthetic payment log item: “Paid amount set”
3. Re-normalizes bill after update.

Why this matters:

- Supports administrative correction of bill-level data.

---

## 6. Computed Metrics Displayed on Page

The page computes four live metrics from current bills:

1. totalBills
- Sum of all bill amounts.

2. totalPaid
- Sum of all paid amounts.

3. totalBalance
- Sum of all balances.

4. completionRate
- Percentage of non-pending bills over total bills.

Additional counters:

- paidCount
- pendingCount

These values feed the top summary cards for at-a-glance financial status.

---

## 7. Add Bill Modal Functions (AddBillModal.tsx)

The Add Bill modal is not a simple form; it includes smart company support.

Core functions:

1. Company suggestions while typing
- Finds company matches by company name or owner name.
- Prioritizes starts-with matches over contains matches.

2. Inline company creation
- If typed company does not exist, user can create a minimal company directly from modal.

3. Bill form submission
- Sends billNo, company name, amount, dateCreated to parent page handler.

Why this matters:

- Greatly reduces friction for bill entry and keeps company naming consistent.

---

## 8. Bill Table Functions (BillTable.tsx)

The Bill table provides operational controls per record.

## 8.1 Row Expansion

- Clicking a bill row expands payment details panel.
- Only one row can be expanded at a time.

## 8.2 Open Newly Added Bill Automatically

- If Business page passes `openBillId`, table opens that bill row immediately.

## 8.3 Payment Sorting

- Payments are sorted by date ascending for consistent timeline view.

## 8.4 startEditPayment / cancelEditPayment

- Switches a payment row into inline edit mode.
- Restores normal mode on cancel.

## 8.5 handleSavePayment

Validation before save:

1. Amount must be numeric and > 0.
2. Updated total paid must not exceed bill amount.

On success:

- Calls parent update handler.
- Exits edit mode.

## 8.6 handleAddPaymentSubmit

Validation before add:

1. Amount must be numeric and > 0.
2. New cumulative paid must not exceed bill amount.

On success:

- Calls parent add handler.
- Clears payment amount input.

## 8.7 onDeletePayment

- Removes selected payment by id through parent callback.

## 8.8 Ledger Access

- Each bill row contains `LedgerPrintModal` trigger.

Why this matters:

- User can complete full payment management without leaving the table context.

---

## 9. Validation and Safety Rules in Business Flow

Built-in safeguards:

1. No overpayment allowed.
2. No non-positive payment values.
3. Status and balance auto-synced to numeric truth.
4. Missing due dates auto-filled.
5. Toast messages provide immediate user feedback on invalid actions.

These constraints prevent common financial data mistakes.

---

## 10. User Journey on the Business Page

Typical flow:

1. User opens Business page.
2. User sees high-level summaries.
3. User adds a new bill.
4. New bill appears at top and auto-expands.
5. User adds one or more payments over time.
6. User edits/deletes payments if needed.
7. Balance and status update instantly.
8. User opens ledger print when required.

This workflow supports both frequent updates and formal statement generation.

---

## 11. Practical Notes for Maintenance

When maintaining this page, keep these rules intact:

1. Always normalize bill after any mutation.
2. Keep overpayment validation in both add and edit paths.
3. Preserve `openBillId` behavior for better UX after bill creation.
4. Keep table expansion and payment log operations lightweight.
5. Ensure summary cards derive from current source state.

---

## 12. Conclusion

The Business page is a complete mini-system for receivable management. It combines summary analytics, transaction-safe editing, smart company-assisted bill creation, and ledger output access in one coherent screen.

Its strongest qualities are:

1. Operational efficiency.
2. Data consistency through normalization.
3. Safety through payment validations.
4. Immediate visual feedback through summaries and status indicators.

For this application, the Business page is the core financial operations engine and a high-value component for daily use.
