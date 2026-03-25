# Billing and Enterprise Management System

## 1. Abstract
The Billing and Enterprise Management System is a finance-focused business management application designed to help small and medium enterprises manage billing operations, payment tracking, company records, expense monitoring, reporting, and ledger printing in one unified platform.

The primary business problem addressed is fragmented record-keeping: many businesses track invoices, payments, and expenses across notebooks, spreadsheets, and disconnected tools. This causes delayed decision-making, poor visibility into pending receivables, and weak auditability.

This project provides a practical solution through a single-page web and mobile-ready application built with React, TypeScript, and Capacitor. The system uses a local-first architecture with secure mobile storage options, offline-friendly data persistence, summary dashboards, and print-ready ledger statements.

## 2. Introduction
Modern businesses require accurate and timely visibility into receivables, outstanding balances, company-level billing relationships, and expense trends. Manual systems or loosely maintained spreadsheets create errors in reconciliation and increase operational overhead.

A Billing and Enterprise Management System is important because it:
- Centralizes billing and payment records.
- Improves financial transparency and decision speed.
- Reduces data duplication and manual calculation errors.
- Supports operational continuity via backup and restore.
- Enables secure access control in mobile usage scenarios.

This implementation targets practical day-to-day operations, especially for businesses that need invoice and ledger tracking without heavy server infrastructure.

## 3. Problem Statement
Without an integrated billing and enterprise management system, organizations commonly face:
- Inconsistent invoice and payment records across tools.
- No real-time view of paid vs pending bills.
- Difficulty tracking customer/company details with GST metadata.
- Lack of categorized personal/operational expense visibility.
- Weak reporting and delayed financial analysis.
- Security risk when financial data is stored without access control.
- Poor document readiness for accounting printouts and audits.

These issues directly affect cash flow monitoring, client follow-up, and management reporting.

## 4. Proposed Solution
The proposed system solves these issues by providing:
- Bill lifecycle management: create bill, add/edit/delete payments, auto-balance updates.
- Company master data management (name, owner, GSTN, address, phone).
- Personal expense tracking with category summaries.
- Dashboard and reports with aggregate metrics and charts.
- Ledger print module for formal account statements.
- Security lock layer (PIN + biometrics on Android native runtime).
- Backup/restore workflow for business continuity.

The solution is implemented as a React-based frontend with local persistence and native plugin integrations for secure storage, biometric verification, and file-picker based backup handling.

## 5. System Architecture
### 5.1 Architectural Style
The implemented system follows a **client-centric, local-first SPA architecture** with optional native mobile wrappers via Capacitor.

- Pattern: Component-based frontend architecture (React SPA).
- Deployment modes:
  - Web mode (browser).
  - Android native mode (Capacitor bridge + custom native plugins).

### 5.2 Layered View
#### Frontend Layer
- Built with React + TypeScript.
- Routing managed by React Router.
- UI components based on shadcn/ui + Radix primitives.
- Data visualization via Recharts.

#### Backend Layer
- No dedicated server/backend service is implemented in this repository.
- No REST/GraphQL service is consumed by the app.
- Business logic executes client-side inside React pages/components.

#### Data Layer
- Primary persistence: browser localStorage (JSON collections).
- Security-sensitive settings on mobile: encrypted native shared preferences through custom Capacitor plugin.
- Backup files: JSON export/import (with native file picker support on Android).

### 5.3 Runtime Architecture
1. User opens app (web or Android shell).
2. App lock gate enforces PIN/biometric unlock on native environments.
3. Modules load local state from localStorage keys.
4. User actions mutate in-memory state and persist to storage.
5. Reports and ledgers are generated directly from stored records.

## 6. Technology Stack
### 6.1 Core
- React 18
- TypeScript 5
- Vite 5

### 6.2 UI and UX
- Tailwind CSS
- shadcn/ui component system
- Radix UI primitives
- Lucide React icons
- Sonner / toast notifications

### 6.3 Data and State
- localStorage (custom hook: persistent reactive state)
- TanStack React Query (present in app shell; not used for remote API calls)

### 6.4 Reporting and Date Utilities
- Recharts (bar and pie visualizations)
- date-fns (date formatting and processing)

### 6.5 Mobile and Native
- Capacitor 8
- Android native bridge
- Custom Capacitor plugins:
  - SecureStore
  - BiometricAuth
  - SaveFile
  - OpenFile
- AndroidX Biometric
- AndroidX Security Crypto (EncryptedSharedPreferences)

### 6.6 Build and Tooling
- ESLint
- PostCSS
- Gradle (Android build)
- Native-run (Android install/run flow)

## 7. Module Description
### 7.1 User Authentication
Implemented as **device-level app lock**, not account-based multi-user authentication.

Features:
- 4-digit PIN setup and verification.
- Biometric unlock (if supported and enabled on Android).
- Lock on every app resume/activation.
- Secure PIN payload hashing using PBKDF2-SHA256.

Current Scope:
- No username/password login.
- No server-issued tokens or role-based access control.

### 7.2 Billing / Invoice Management
Core implemented module.

Features:
- Add new bill (bill number, company name, amount, created date).
- Auto due-date generation (+30 days from created date).
- Payment recording with date and optional note.
- Payment edit/delete support.
- Automatic recalculation of:
  - Paid amount
  - Balance
  - Status (paid/pending)
- Overpayment prevention logic.
- Ledger statement generation and print layout.

### 7.3 Customer Management
Implemented as **Companies module**.

Features:
- Create/update/delete company profiles.
- Fields: company name, owner name, GSTN, address, phone.
- GSTN normalization and validation (15 characters).
- Duplicate company-name prevention.
- Company suggestion and quick-create support from bill creation form.

### 7.4 Product / Inventory Management
Not implemented in current codebase.

Observation:
- No product catalog, SKU, stock-in/out, reorder levels, or inventory valuation.

### 7.5 Sales Tracking
Partially implemented through bill and payment tracking.

Implemented:
- Bill amount vs paid amount vs outstanding balance.
- Pending/paid bill status summaries.
- Trend visibility via dashboard/reports.

Not implemented:
- Sales order lifecycle, item-wise sales, channel-wise sales, tax invoice generation pipeline.

### 7.6 Reporting and Analytics
Implemented analytics module.

Features:
- Dashboard cards for total bill amount, paid, outstanding, expenses.
- Pending bill listing and recent expense snapshots.
- Business bar chart (paid vs balance by bill).
- Personal expense pie chart by category.
- Category-wise percentage breakdown.

## 8. Database Design
### 8.1 Data Storage Model
There is no relational DBMS in this project. Data is stored as JSON records in local storage keys and secure native key-value storage for sensitive fields.

### 8.2 Logical Tables / Collections
#### 1) bills (localStorage key: expense-compass:bills)
Attributes:
- id (PK)
- billNo
- name (company/customer display name)
- billAmount
- paid
- balance
- status (paid | pending | completed)
- dateCreated
- dueDate
- payments (array of Payment objects)

Embedded Payment attributes:
- id (Payment PK within bill context)
- amount
- date
- note

#### 2) companies (localStorage key: expense-compass:companies)
Attributes:
- id (PK)
- companyName
- ownerName
- gstn
- address
- phoneNumber
- createdAt
- updatedAt

#### 3) expenses (localStorage key: expense-compass:expenses)
Attributes:
- id (PK)
- category
- description
- amount
- date

#### 4) app lock settings (secure key: expense-compass:applock:settings)
Attributes:
- version
- fingerprintEnabled

#### 5) app lock PIN payload (secure key: expense-compass:applock:pin)
Attributes:
- version
- saltB64
- hashB64
- iterations

### 8.3 Relationships
- Company to Bills: logical one-to-many via bill.name string matching companyName (soft relation, no foreign key).
- Bill to Payments: one-to-many embedded relationship.
- Expenses: standalone transaction set.

### 8.4 Keys and Constraints
- Primary keys are UUID-like string identifiers generated client-side.
- No database-level foreign keys.
- Referential consistency is enforced by application logic only.

## 9. API Documentation
### 9.1 Backend HTTP APIs
No backend HTTP APIs are implemented in this repository.

- Endpoint count: 0
- Protocol: N/A
- HTTP methods: N/A

### 9.2 Internal Native Plugin APIs (Capacitor)
Although no REST APIs exist, the application exposes native bridge APIs used by frontend code.

#### SecureStore Plugin
- Method: get
  - Input: key
  - Output: value
  - Purpose: read sensitive setting/PIN payload.
- Method: set
  - Input: key, value
  - Output: success/failure
  - Purpose: write sensitive values securely.
- Method: remove
  - Input: key
  - Output: success/failure
  - Purpose: delete secure values.

#### BiometricAuth Plugin
- Method: isAvailable
  - Input: none
  - Output: available (boolean)
  - Purpose: check biometric capability.
- Method: verify
  - Input: title, subtitle
  - Output: success (boolean)
  - Purpose: user biometric verification for unlock.

#### SaveFile Plugin
- Method: save
  - Input: filename, mimeType, data
  - Output: uri
  - Purpose: write exported backup file through system picker.

#### OpenFile Plugin
- Method: pick
  - Input: mimeType
  - Output: name, data
  - Purpose: read backup file via system picker.

## 10. System Workflow
### 10.1 Startup and Security
1. Application initializes routes and global providers.
2. App lock gate checks native mode and stored PIN settings.
3. If PIN not configured, user completes PIN setup.
4. If configured, user unlocks via biometric or PIN.

### 10.2 Billing Workflow
1. User navigates to Business module.
2. Creates bill (company, bill number, amount, date).
3. System computes due date (+30 days) and initial pending state.
4. User records payment transactions over time.
5. System blocks overpayments and recomputes paid/balance/status.

### 10.3 Ledger Generation Workflow
1. User opens ledger from bill actions or Ledger page.
2. System builds ledger entries from bill amount + payment log.
3. Entries are sorted by date and running balance is computed.
4. User prints A4 ledger statement using browser/native print flow.

### 10.4 Reporting Workflow
1. Dashboard aggregates totals from bills and expenses.
2. Reports module computes chart datasets.
3. User reviews paid vs pending status and category-wise expenses.

### 10.5 Backup and Restore Workflow
1. User exports backup from Settings.
2. System packages all major data keys into JSON payload.
3. User restores by selecting backup file.
4. Data is overwritten and app reloads.

## 11. Key Algorithms or Logic
### 11.1 Bill Normalization
- balance = max(0, billAmount - paid)
- status = paid if balance == 0 else pending
- Legacy records are migrated automatically to normalized values.

### 11.2 Due Date Computation
- dueDate = dateCreated + 30 days (millisecond arithmetic).

### 11.3 Payment Integrity Rules
- Add/update payment allowed only when resulting paid <= billAmount.
- Paid amount is recomputed from payment list for consistency after edits/deletes.

### 11.4 Ledger Balance Computation
- Opening credit entry is created from bill amount.
- Payment entries are treated as debit transactions.
- Running balance update rule:
  - runningBalance = runningBalance + credit - debit
- Closing balance = billAmount - totalPaid

### 11.5 Security Hashing Logic
- PIN is validated as 4 digits.
- Salt generated randomly per PIN.
- Hash derived using PBKDF2-SHA256 with 150,000 iterations.
- Verification uses constant-time style byte comparison.

### 11.6 Tax Computation Status
- Tax metadata (GSTN fields) is captured and displayed.
- No dynamic tax computation (CGST/SGST/IGST) is currently implemented.

## 12. User Interface Description
### 12.1 Pages/Screens
- Dashboard: financial summary cards, pending bills, recent expenses, quick links.
- Business: bill summaries, bill table, expandable payment logs, add payment actions.
- Companies: company master form and tabular management.
- Ledger: bill selector + print-ready ledger preview.
- Personal: expense entry and category summary.
- Reports: business and personal analytics visualizations.
- Settings: PIN management, biometrics toggle, backup/export restore.
- NotFound: fallback route for unknown paths.

### 12.2 UI Characteristics
- Responsive layout with desktop and mobile navigation.
- Sticky top navbar with route-aware active states.
- Toast feedback for user actions and validations.
- Print-specific stylesheet for professional ledger output.

## 13. Security Features
Implemented security controls:
- App-level lock on native platforms.
- PIN-based unlock with secure hash payload.
- Biometric unlock integration.
- Encrypted native key-value storage for sensitive lock data.
- Secure fallback handling in case plugin unavailability.
- Backup/restore controls with explicit user action and overwrite warning.

Security considerations:
- Main business datasets (bills/companies/expenses) remain in localStorage (not encrypted in web mode).
- No server-side auth, session management, or role permissions.

## 14. Advantages of the System
- Simple deployment and operation (no backend requirement).
- Offline-friendly local-first design.
- Fast CRUD workflows for billing and expenses.
- Strong usability for SMEs and single-operator businesses.
- Native-capable security and backup integration on Android.
- Professional print-ready ledger output.
- Clear, visual reporting for quick management insights.

## 15. Limitations
- No centralized multi-user backend.
- No cloud sync across devices.
- No role-based authorization or user account model.
- No product/inventory subsystem.
- No automated tax computation engine.
- Company-bill relationship is soft (name-based) rather than foreign-key based.
- Export buttons for PDF/Excel are currently placeholders unless handlers are wired.

## 16. Future Enhancements
Recommended enhancements for enterprise readiness:
- Add backend service (Node.js/.NET/Java) with REST APIs.
- Introduce relational database (PostgreSQL/MySQL) with normalized schema and FK constraints.
- Implement full authentication and RBAC (Admin, Accountant, Viewer).
- Add product catalog and inventory stock management.
- Implement invoice tax engine (GST slabs, CGST/SGST/IGST split, discounts).
- Enable cloud backup/sync and multi-device collaboration.
- Implement true PDF/Excel export generation.
- Add audit logs, soft delete, and recovery workflows.
- Add automated reminders for due invoices and aging analysis.
- Add unit/integration test suite and CI pipeline.

## 17. Conclusion
The Billing and Enterprise Management System delivers a practical and well-structured foundation for billing operations, receivable tracking, expense monitoring, and reporting. The current implementation is particularly effective for local/offline-first usage and mobile-assisted workflows, with added value from secure app-lock capabilities and ledger print support.

From an academic and engineering perspective, the project demonstrates strong frontend architecture, meaningful business logic, and extensible module design. While some enterprise modules (inventory, backend APIs, tax automation, multi-user controls) are not yet implemented, the existing system provides a robust base for incremental expansion into a full-scale enterprise platform.
