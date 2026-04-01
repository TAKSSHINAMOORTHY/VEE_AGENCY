# TITLE

**VEE Agency (Expense Compass): Billing and Enterprise Management System**

Project Report on a Local-First Billing, Expense Tracking, Ledger Printing, and Secure Android-Assisted Financial Management Application

---

# ABSTRACT

VEE Agency, branded in parts of the codebase as Expense Compass, is a finance-oriented business application designed to centralize billing operations, company management, payment tracking, personal expense monitoring, reporting, ledger generation, backup, and device-level security in a single system. The project addresses a common small-business problem: financial records are often scattered across notebooks, spreadsheets, chats, and informal follow-up methods, which causes poor visibility into receivables, delayed reconciliations, duplicated data entry, and weak audit readiness.

The implemented solution is a React 18 + TypeScript single-page application built with Vite and enhanced for Android through Capacitor. The system is intentionally local-first. Business bills, companies, and expenses are stored in browser `localStorage`, while security-sensitive settings such as the app-lock PIN and biometric preferences are stored through a native encrypted storage plugin on Android. The application includes a dashboard for quick financial overview, a business billing module for receivable tracking, a companies module for master data management, a personal expense module for category-based monitoring, a reports module with charts, a ledger print module for formal A4 statements, and a settings module for PIN management and full backup/restore.

From a software engineering perspective, the project is notable for combining an SPA architecture, offline-friendly persistence, native security plugins, and print-first document output without requiring a backend server. At the same time, the repository also reveals current limitations that are important in an academic report: there is no centralized database, no multi-user role model, no inventory subsystem, no backend APIs, and some UI affordances such as PDF/Excel export buttons are currently placeholders rather than full export pipelines. Overall, the project demonstrates a strong applied implementation for small-scale financial operations, especially where low infrastructure cost, operational simplicity, and mobile-assisted local usage are important.

---

# LIST OF TABLES

1. Table 1. Technology Stack and Runtime Profile
2. Table 2. Major Functional Modules
3. Table 3. Environment and Deployment Requirements
4. Table 4. Functional Requirements
5. Table 5. Non-Functional Requirements
6. Table 6. Core Business Rules and Logic
7. Table 7. Input and Validation Summary
8. Table 8. Logical Data Collections and Storage Keys
9. Table 9. System Testing Matrix
10. Table 10. Mapping of Project Goals to SDG

---

# LIST OF FIGURES

1. Figure 1. High Level Architecture Diagram
2. Figure 2. ER Diagram
3. Figure 3. Dataflow Diagram
4. Figure 4. Use Case Diagram
5. Figure 5. Sequence Diagram

---

# INTRODUCTION

## 1.1 OVERVIEW OF THE PROJECT

VEE Agency is a billing and enterprise management application intended to help a small or medium business maintain financial clarity with minimal operational friction. The system combines day-to-day bill tracking with expense recording, reporting, and professional ledger output. Instead of using a client-server model, the implemented repository follows a local-first design in which the application executes all business logic on the client side and persists data within the device or browser environment.

The application supports the following core business capabilities:

1. Company master data maintenance.
2. Bill creation with auto-generated due dates.
3. Payment recording, editing, and deletion.
4. Automatic paid/balance/status recalculation.
5. Personal expense tracking with category summaries.
6. Visual reporting using business and expense charts.
7. Ledger statement generation and printing.
8. Device-level security using a 4-digit PIN and Android biometrics.
9. Backup and restore of application data.

The codebase indicates two product identities:

1. `Expense Compass` is the user-facing name visible in the README, storage keys, backup filenames, and security text.
2. `VEE Agency` is the design/documentation identity used in project documentation and default ledger branding.

This report treats both names as the same project implementation.

**Table 1. Technology Stack and Runtime Profile**

| Layer | Technology | Role in System |
| --- | --- | --- |
| Frontend framework | React 18 | Component-based SPA implementation |
| Language | TypeScript 5 | Strong typing for pages, hooks, models, and security payloads |
| Build tool | Vite 5 | Fast development server and production build pipeline |
| Routing | React Router 6 | Page-level navigation between dashboard, business, companies, ledger, personal, reports, and settings |
| UI system | Tailwind CSS, shadcn/ui, Radix UI | Reusable and responsive user interface construction |
| Charts | Recharts | Bar and pie visual analytics for business and expense reports |
| Date utilities | date-fns | Human-readable date formatting and date calculations |
| State persistence | `localStorage` via custom hook | Local-first storage of bills, companies, and expenses |
| Native wrapper | Capacitor 8 | Android packaging and native plugin bridge |
| Native security | EncryptedSharedPreferences, Android Biometric | Secure storage of PIN/settings and biometric unlock |
| File operations | Custom Capacitor plugins | Backup export and restore using Android file pickers |
| Quality tooling | ESLint, TypeScript compiler | Static correctness and code quality checks |

## 1.2 OBJECTIVES

The primary objectives of the project are:

1. To centralize business billing, payment tracking, and company information in one application.
2. To provide real-time visibility into total receivables, paid amounts, pending balances, and spending.
3. To reduce manual reconciliation effort by automatically recalculating balances and payment status.
4. To maintain a lightweight solution that works without backend infrastructure.
5. To support both browser usage and Android-assisted native usage through Capacitor.
6. To improve trust and document readiness through professional ledger print layouts.
7. To protect financial data on Android devices through PIN-based and biometric access control.
8. To support continuity of operations through full backup and restore.
9. To provide a system architecture that is extensible for future enterprise features such as APIs, inventory, multi-user access, and cloud synchronization.

## 1.3 SYSTEM STUDY

The project can be studied from four complementary angles: domain study, implementation study, feasibility study, and user-operation study.

### Domain Study

The target problem space is receivable and expense management for a small business. The repository strongly suggests a workflow centered on business owners, billing operators, or accounts staff. This role interpretation is an inference from the implemented features because the application does not include a user-role database or multi-user login. The application emphasizes:

1. Bill creation and payment follow-up.
2. Company identity and GST-related business records.
3. Outstanding balance monitoring.
4. Personal or operational expense logging.
5. Ledger generation for accounting communication.

### Implementation Study

The codebase reveals a component-oriented SPA where:

1. Routes are declared in `src/App.tsx`.
2. Persistent local state is handled by `src/hooks/useLocalStorageState.ts`.
3. Billing logic is centralized in `src/hooks/useBusinessBills.ts`.
4. Security lock behavior is handled through `src/security/useAppLock.ts` and `src/security/AppLockGate.tsx`.
5. Native Android capabilities are exposed through custom Capacitor plugins registered in `android/app/src/main/java/com/expensecompass/app/MainActivity.java`.

### Feasibility Study

The implementation is technically feasible because it avoids backend dependency, uses widely adopted frontend tooling, and packages the same codebase for Android with Capacitor. It is operationally feasible because navigation and module boundaries are straightforward. It is economically feasible for small deployments because there is no server hosting or database administration requirement. However, the same design choice also limits scalability, cross-device synchronization, centralized audit control, and collaborative access.

### User-Operation Study

The implemented workflows show a repetitive operational pattern:

1. Add or locate a company.
2. Create a bill for that company.
3. Record one or more payments over time.
4. Monitor balance and status changes.
5. View dashboards and reports.
6. Print or export a ledger when formal documentation is needed.
7. Backup data periodically.

## 1.4 PROBLEM DESCRIPTION

In many small business settings, billing and payment records are maintained manually or semi-digitally across multiple disconnected tools. Typical problems include:

1. Bills are created in one place but payments are tracked elsewhere.
2. Company details are inconsistent or duplicated.
3. Balance status is calculated manually, increasing the risk of error.
4. Outstanding bills are not visible in a timely manner.
5. Personal or operational expenses are not analyzed by category.
6. Ledger statements are difficult to prepare in a formal, printable layout.
7. Sensitive financial data may remain unprotected on shared or mobile devices.
8. Data loss risk increases when no structured backup mechanism exists.

The project addresses these problems by replacing fragmented financial record-keeping with a unified, local-first operational system.

---

# SYSTEM ANALYSIS

## 2.1 EXISTING SYSTEM

The existing system, in a business context prior to using this application, can be characterized as a manual or loosely digital process with the following properties:

1. Companies, invoices, and payments are often tracked in notebooks or spreadsheets.
2. Outstanding balances are computed manually.
3. Payment history may be incomplete or difficult to audit.
4. Ledger statements are either handwritten, assembled manually, or recreated from scattered data.
5. Expense tracking is rarely integrated with billing analysis.
6. Data security is weak because records may live in plain files or unlocked devices.
7. Backups depend on ad hoc copying rather than a structured export mechanism.

From an information systems perspective, the existing system is low-cost initially but high-friction over time because the overhead of correction, reconciliation, and reporting grows with data volume.

## 2.2 PROPOSED SYSTEM

The proposed system implemented in this repository is a unified, local-first financial workspace that provides a single operational surface for billing, companies, expenses, reporting, ledger printing, and Android device security.

Key characteristics of the proposed system are:

1. Single-page application architecture for fast navigation.
2. Local data persistence for offline-friendly usage.
3. Reusable shared UI patterns across modules.
4. Automated business logic for balances, statuses, and due dates.
5. Native Android integration for secure storage, biometrics, and file access.
6. Print-first ledger generation for business communication.

**Table 2. Major Functional Modules**

| Module | Core Responsibilities | Current Status |
| --- | --- | --- |
| Dashboard | High-level bill, payment, outstanding, and expense overview | Implemented |
| Business Bills | Create bills, group by company, monitor payment state | Implemented |
| Company Management | Create, edit, delete company master records | Implemented |
| Company Detail | Company-wise bill view, direct transaction entry, company report | Implemented |
| Personal Expenses | Add, edit, delete expenses and analyze by category | Implemented |
| Reports | Bar and pie chart based financial summaries | Implemented |
| Ledger | Bill-wise printable ledger statement | Implemented |
| Security | PIN setup, PIN verification, biometric unlock on Android | Implemented |
| Backup and Restore | Export/import JSON backups including secure settings | Implemented |
| PDF/Excel data export buttons | Quick export controls in UI | Partially implemented, current callbacks default to toast placeholders |
| Inventory/Product management | Product catalog and stock logic | Not implemented |
| Backend API integration | Remote storage, sync, multi-device collaboration | Not implemented |

## 2.3 HIGH LEVEL ARCHITECTURE DIAGRAM

**Figure 1. High Level Architecture Diagram**

```mermaid
flowchart TD
    U[User] --> UI[React SPA UI]
    UI --> R[React Router Pages]
    UI --> BL[Client-side Business Logic]
    BL --> LS[localStorage Collections<br/>bills, companies, expenses]
    BL --> REP[Reports and Charts]
    BL --> LED[Ledger Print Layout]
    UI --> SEC[App Lock Layer]
    SEC --> NATIVE[Capacitor Native Bridge]
    NATIVE --> SSTORE[SecureStore Plugin<br/>EncryptedSharedPreferences]
    NATIVE --> BIO[BiometricAuth Plugin]
    NATIVE --> FILES[OpenFile / SaveFile Plugins]
    FILES --> BACKUP[JSON Backup Files]
    LED --> PRINT[Browser/Android Print Output]
```

### Architecture Interpretation

The diagram shows that the application is not divided into frontend and backend servers. Instead, all business operations execute in the client runtime. This reduces infrastructure complexity and enables offline-first behavior, but also means:

1. Data is device-local by default.
2. Collaboration across users is not natively supported.
3. Security depends heavily on device access and local storage practices.
4. Large-scale enterprise governance would require future backend integration.

## 2.4 ER DIAGRAM

**Figure 2. ER Diagram**

```mermaid
erDiagram
    COMPANY {
        string id PK
        string companyName
        string ownerName
        string gstn
        string address
        string phoneNumber
        string createdAt
        string updatedAt
    }

    BILL {
        string id PK
        string billNo
        string name
        string companyId
        number billAmount
        number paid
        number balance
        string status
        string dateCreated
        string dueDate
    }

    PAYMENT {
        string id PK
        number amount
        string date
        string note
    }

    EXPENSE {
        string id PK
        string category
        string description
        number amount
        string date
    }

    APP_LOCK_PIN {
        number version
        string saltB64
        string hashB64
        number iterations
    }

    APP_LOCK_SETTINGS {
        number version
        boolean fingerprintEnabled
    }

    COMPANY o|--o{ BILL : "associated by companyId or matched name"
    BILL ||--o{ PAYMENT : contains
```

### ER Analysis

The logical model shows the most important structural characteristic of the system: it does not use a relational database engine. Instead:

1. `Bill -> Payment` is a strong embedded one-to-many relationship.
2. `Company -> Bill` is a soft relationship, because bills may reference `companyId`, company name, or both.
3. `Expense` is independent from billing entities.
4. Security entities are stored separately from general app data.

This design is simple and practical for local operation, but the soft company relationship introduces a possible data quality risk if names are changed after bills are created.

## 2.5 DATAFLOW DIAGRAM

**Figure 3. Dataflow Diagram**

```mermaid
flowchart LR
    USER[User] --> D1[Dashboard / Business / Personal / Reports / Settings]
    D1 --> P1[Input Forms and Actions]
    P1 --> P2[Validation and Business Logic]
    P2 --> DS1[(localStorage<br/>Bills, Companies, Expenses)]
    P2 --> DS2[(Secure Store<br/>PIN, App Lock Settings)]
    P2 --> DS3[(JSON Backup File)]
    DS1 --> P3[Computed Totals, Status, Charts]
    DS2 --> P4[App Lock Decisions]
    P3 --> OUT1[Tables, Cards, Reports, Ledger]
    P4 --> OUT2[Unlock / Lock UI]
    OUT1 --> USER
    OUT2 --> USER
```

### DFD Interpretation

The dataflow of the system is direct and compact:

1. Users submit data through UI forms.
2. Client-side validation and business logic process the data.
3. Persistent state is stored either in `localStorage`, secure native storage, or backup files.
4. Computed summaries and reports are derived directly from stored data.

## 2.5.1 USE CASE DIAGRAM

**Figure 4. Use Case Diagram**

```mermaid
flowchart TD
    ACTOR([Primary User])
    UC1((Manage Companies))
    UC2((Create Bill))
    UC3((Record Payment))
    UC4((Track Personal Expense))
    UC5((View Dashboard))
    UC6((Generate Reports))
    UC7((Print Ledger))
    UC8((Export Backup))
    UC9((Restore Backup))
    UC10((Unlock App with PIN/Biometrics))

    ACTOR --> UC1
    ACTOR --> UC2
    ACTOR --> UC3
    ACTOR --> UC4
    ACTOR --> UC5
    ACTOR --> UC6
    ACTOR --> UC7
    ACTOR --> UC8
    ACTOR --> UC9
    ACTOR --> UC10
```

## 2.5.2 SEQUENCE DIAGRAM

**Figure 5. Sequence Diagram**

```mermaid
sequenceDiagram
    participant User
    participant UI as Business Company Detail UI
    participant Hook as useBusinessBills
    participant Store as localStorage
    participant Report as Dashboard/Reports

    User->>UI: Enter payment amount and date
    UI->>Hook: handleAddPayment(billId, amount, date, note)
    Hook->>Hook: Recalculate paid, balance, status
    Hook->>Store: Persist updated bills array
    Store-->>Hook: Updated record stored
    Hook-->>UI: Normalized bill data returned
    Report->>Store: Read latest bills on next render
    Store-->>Report: Updated totals and balances
    Report-->>User: Dashboard/reports reflect new payment
```

## 2.6 USER JOURNEY AND WORKFLOWS

The user journey is intentionally short, repetitive, and low-friction. The main workflows are described below.

### Workflow A: First-Time Secure Access on Android

1. User opens the application on an Android device.
2. `AppLockGate` overlays the application.
3. If no PIN exists, the user creates and confirms a 4-digit PIN.
4. The PIN is transformed into a PBKDF2-SHA256 payload with salt and iteration count.
5. The payload is stored in encrypted native storage.
6. On subsequent launches or app resume events, the user unlocks using biometrics or PIN.

### Workflow B: Company and Bill Creation

1. User creates a company from the Companies page or directly from the Add Bill dialog.
2. User enters company details such as name, owner, GSTN, address, and phone.
3. User opens the Add Bill dialog.
4. User selects or types a company name, enters bill number, bill amount, and creation date.
5. The system automatically calculates the due date as 30 days from creation date.
6. The new bill is saved and surfaced in business summaries.

### Workflow C: Payment Collection and Reconciliation

1. User opens the company detail screen or bill table.
2. User expands a bill to view payment history.
3. User records a payment with amount and date.
4. The application blocks overpayment if the new paid total exceeds bill amount.
5. Balance and status are recalculated instantly.
6. Dashboard, reports, and company summaries reflect the new state.

### Workflow D: Expense Recording

1. User opens the Personal module.
2. User enters category, description, amount, and date.
3. The expense is persisted locally.
4. Summary cards, category totals, and charts update automatically.

### Workflow E: Ledger and Reporting

1. User views the Reports page for visual financial analysis.
2. User opens a bill-specific ledger from the business table or the dedicated ledger page.
3. The system generates a print-friendly ledger with debit, credit, and running balance.
4. User prints directly or saves through browser or Android print workflows.

### Workflow F: Backup and Recovery

1. User opens Settings.
2. User exports a JSON backup containing business data and secure app-lock data.
3. On web, a file download is created.
4. On Android, a native file picker saves the backup and can optionally share it.
5. For restore, the application reads the selected JSON file and overwrites current app data.

## 2.7 SYSTEM REQUIREMENTS

The system requirements can be interpreted in two layers:

1. Environment requirements needed to run or build the application.
2. Functional and non-functional requirements needed to satisfy user and business needs.

**Table 3. Environment and Deployment Requirements**

| Category | Requirement | Notes |
| --- | --- | --- |
| Web runtime | Modern browser | Chrome, Edge, Firefox, Safari, or equivalent modern browser |
| Android runtime | Android device with Capacitor app shell | Native security features are most meaningful here |
| Android minimum SDK | API 24 | Derived from `android/variables.gradle` |
| Development runtime | Node.js and npm or Bun | Used for package install and scripts |
| Build system | Vite | Used for web production builds |
| Native build tooling | Android Studio, Gradle, JDK | Required for Android APK generation |
| Persistent storage | Browser `localStorage` | Bills, companies, expenses |
| Secure storage | EncryptedSharedPreferences | PIN and app-lock settings on Android |
| Print support | Browser/OS print service | Required for ledger document generation |

### 2.7.1 FUNCTIONAL REQUIREMENTS

**Table 4. Functional Requirements**

| FR ID | Requirement | Implementation Insight |
| --- | --- | --- |
| FR-01 | The system shall allow creation of company records. | Implemented in Companies page |
| FR-02 | The system shall prevent duplicate company names. | Enforced in company submission logic |
| FR-03 | The system shall validate GSTN length to 15 uppercase alphanumeric characters. | Enforced in Companies page |
| FR-04 | The system shall allow creation of business bills. | Implemented in Add Bill modal |
| FR-05 | The system shall auto-calculate due date from bill creation date. | Implemented as +30 days |
| FR-06 | The system shall allow adding payments against a bill. | Implemented in bill expansion and company detail |
| FR-07 | The system shall recalculate paid amount, balance, and status after every payment change. | Implemented in `useBusinessBills` |
| FR-08 | The system shall block overpayment beyond bill amount. | Implemented during add/edit payment |
| FR-09 | The system shall allow editing and deleting payments. | Implemented in bill payment log |
| FR-10 | The system shall display dashboard totals for bills, paid amount, outstanding amount, and expenses. | Implemented in Dashboard page |
| FR-11 | The system shall allow creation, editing, and deletion of personal expenses. | Implemented in Personal page |
| FR-12 | The system shall display category summaries and charts. | Implemented in Personal and Reports pages |
| FR-13 | The system shall generate printable ledger statements. | Implemented in ledger components |
| FR-14 | The system shall protect access on Android using PIN and optional biometrics. | Implemented in app lock module |
| FR-15 | The system shall export and restore backup data. | Implemented in Settings |
| FR-16 | The system shall support route-based navigation across modules. | Implemented in app routing |

### 2.7.2 NON-FUNCTIONAL REQUIREMENTS

**Table 5. Non-Functional Requirements**

| NFR ID | Requirement | Current Realization |
| --- | --- | --- |
| NFR-01 | Usability | Clean navigation and repeated UI patterns reduce learning effort |
| NFR-02 | Performance | Local-first processing avoids network latency for normal operations |
| NFR-03 | Offline capability | Core business features work without backend dependency |
| NFR-04 | Reliability | Local persistence and backup/restore improve continuity |
| NFR-05 | Security | PIN hashing plus encrypted Android storage and biometrics |
| NFR-06 | Maintainability | TypeScript models, component separation, and hooks improve maintainability |
| NFR-07 | Portability | Runs on web and Android via Capacitor |
| NFR-08 | Scalability | Limited at present because there is no backend or shared database |
| NFR-09 | Print quality | Dedicated A4 print layout for ledger output |
| NFR-10 | Data integrity | Moderate; enforced mainly in application logic rather than DB constraints |

---

# SYSTEM DESIGN

## 3.1 BUSINESS RULES AND LOGIC

The project embeds several business rules directly into the frontend logic rather than a backend service or stored procedures.

**Table 6. Core Business Rules and Logic**

| Rule ID | Business Rule | Design Outcome |
| --- | --- | --- |
| BR-01 | Every bill must have a bill number, company name, amount, and creation date. | Ensures minimal billing completeness |
| BR-02 | Bill due date is automatically set to 30 days after creation date. | Standardized receivable follow-up |
| BR-03 | Bill balance equals `billAmount - paid`, with lower bound 0. | Prevents negative balances |
| BR-04 | Bill status becomes `paid` when balance is 0; otherwise `pending`. | Provides instant operational status |
| BR-05 | A payment amount must be greater than 0. | Prevents invalid financial entries |
| BR-06 | Aggregate payments must not exceed bill amount. | Prevents overpayment distortion |
| BR-07 | Company names must be unique in the formal Companies module. | Reduces duplicate masters |
| BR-08 | GSTN must be normalized to uppercase alphanumeric and capped at 15 characters. | Improves data cleanliness |
| BR-09 | App unlock PIN must be exactly 4 digits. | Simplifies secure device access |
| BR-10 | App relocks on every resume/activation in native mode. | Strengthens session security |
| BR-11 | Backup restore overwrites current application data. | Keeps restore behavior deterministic |

### Important Implementation Insight

A particularly strong design decision is that billing normalization occurs through a reusable function, not scattered page logic. This is visible in `normalizeBill` inside `src/hooks/useBusinessBills.ts`, which recalculates due date, balance, and status consistently.

## 3.2 INPUT DESIGN

The input design is optimized for operational clarity rather than visual excess. Inputs are grouped by the task users are performing and are generally short, form-based, and immediate.

**Table 7. Input and Validation Summary**

| Input Area | Fields | Validation / Behavior | Module |
| --- | --- | --- | --- |
| Company form | Company name, owner name, GSTN, address, phone number | Duplicate company check, GSTN normalization and length enforcement | Companies |
| Bill form | Company name, bill number, amount, creation date | Required fields, company suggestions, quick-create company support | Business |
| Payment form | Amount, date, optional note | Positive amount, overpayment block | Business / Company Detail |
| Expense form | Category, description, amount, date | Required fields, numeric amount | Personal |
| App lock setup | 4-digit PIN, confirm PIN | Exact 4-digit validation, confirmation match | Security |
| Backup import | JSON file | Version and format validation | Settings |

### Input Design Strengths

1. Forms are short and task-specific.
2. The Add Bill flow supports company suggestions, improving speed.
3. Direct transaction support in the company detail page reduces workflow detours.
4. Numeric financial inputs use dedicated number fields.
5. Security input uses OTP-style PIN slots for clarity.

### Input Design Observations

1. Quick-created companies from the Add Bill dialog are intentionally lightweight and may be created without full owner, GSTN, address, and phone details.
2. This is useful operationally, but it can reduce master-data completeness if users do not later enrich those company records.

## 3.3 DATABASE DESIGN

There is no traditional relational database in the implemented project. The database design is therefore a logical storage model rather than a DBMS schema.

### Storage Strategy

1. Business and expense data are stored in browser `localStorage`.
2. Sensitive security data are stored through secure native storage on Android.
3. Backups are serialized to versioned JSON files.

**Table 8. Logical Data Collections and Storage Keys**

| Collection / Key | Storage Medium | Main Attributes | Notes |
| --- | --- | --- | --- |
| `expense-compass:bills` | `localStorage` | `id`, `billNo`, `name`, `companyId`, `billAmount`, `paid`, `balance`, `status`, `dateCreated`, `dueDate`, `payments[]` | Core receivable collection |
| `expense-compass:companies` | `localStorage` | `id`, `companyName`, `ownerName`, `gstn`, `address`, `phoneNumber`, timestamps | Company master data |
| `expense-compass:expenses` | `localStorage` | `id`, `category`, `description`, `amount`, `date` | Personal or operational expense log |
| `expense-compass:applock:pin` | Secure native storage or fallback local storage | `version`, `saltB64`, `hashB64`, `iterations` | PIN payload |
| `expense-compass:applock:settings` | Secure native storage or fallback local storage | `version`, `fingerprintEnabled` | Biometric preference |
| Legacy ledger company keys | `localStorage` | Company header details for print mode | Backward-compatible ledger settings |

### Data Design Evaluation

The storage design is suitable for lightweight, device-local operation. Its advantages are:

1. Zero server dependency.
2. Fast reads and writes.
3. Simple JSON backup and restore.
4. Low operational cost.

Its limitations are:

1. No SQL querying or advanced filtering engine.
2. No foreign key enforcement.
3. No conflict resolution for multiple devices.
4. No centralized audit trail.

## 3.4 MODULE DESCRIPTION

### 3.4.1 MODULE 1: BUSINESS BILLING AND COMPANY MANAGEMENT

This is the core business module and the center of the project's value proposition.

#### Sub-functions

1. Company creation, update, and deletion.
2. Bill creation with bill number, amount, and date.
3. Company-wise bill grouping.
4. Payment logging with recalculated balances.
5. Company detail reporting and direct transaction entry.
6. Bill-level ledger launch.

#### Design Strengths

1. Strong visibility into paid and outstanding amounts.
2. Company grouping improves account-level tracking.
3. Expandable payment logs support progressive disclosure.
4. Recalculation logic is centralized and reusable.

#### Current Constraints

1. Company-to-bill linkage is soft and partially name-based.
2. No invoice tax breakdown or item-level bill lines exist.
3. No backend-driven audit or approval workflow exists.

### 3.4.2 MODULE 2: PERSONAL EXPENSES AND ANALYTICS

This module complements the billing system by allowing non-bill spending analysis.

#### Sub-functions

1. Expense creation, update, and deletion.
2. Category-level aggregation.
3. Monthly and average-spend summary cards.
4. Personal expense table and charts.
5. Category breakdown visualization in reports.

#### Design Strengths

1. Shared UI patterns make the module easy to learn.
2. Category summaries provide instant spending insight.
3. Reports module reuses the same stored data to generate visuals.

#### Current Constraints

1. No budget threshold, recurring expense, or approval workflow is implemented.
2. Expense categories are free-form strings instead of a controlled master taxonomy.

### 3.4.3 MODULE 3: SECURITY, LEDGER, AND BACKUP

This module group differentiates the project from a simple local spreadsheet replacement.

#### Security

1. Android-native app lock is enabled through `AppLockGate`.
2. PINs are not stored in plain text.
3. The project uses PBKDF2-SHA256 with 150,000 iterations and a random salt.
4. Encrypted storage uses Android `EncryptedSharedPreferences` with a generated `MasterKey`.
5. Biometrics can be enabled or disabled through app-lock settings.

#### Ledger

1. Bill payments are transformed into debit and credit entries.
2. Running balance is calculated chronologically.
3. The print layout includes company details, client details, totals, signature areas, and terms.
4. Styling is optimized for A4 print output.

#### Backup and Restore

1. Export collects all app-scoped local keys and secure app-lock data.
2. Android backup uses native file creation and optional sharing.
3. Restore validates versioned JSON and overwrites current data.

#### Current Constraints

1. The security lock is most meaningful on Android native runtime; web mode falls back differently and is not equivalent to full native protection.
2. Restore is destructive in the sense that it overwrites current data.

## 3.5 OUTPUT DESIGN

The application produces several classes of output.

### Operational Outputs

1. Dashboard summary cards for total bills, paid amount, outstanding amount, and expenses.
2. Business tables grouped by company and bill.
3. Payment logs with date-wise entries.
4. Personal expense tables with category icons and edit/delete controls.

### Analytical Outputs

1. Bar chart showing paid versus balance by bill.
2. Pie chart showing expense distribution by category.
3. Category percentage bars for spending analysis.

### Documentary Outputs

1. Printable ledger statement in A4 format.
2. Company report printout from the company detail page.
3. JSON backup file for system recovery.

### Output Design Evaluation

The output design is strong because it serves both screen-based operations and document-based accounting needs. This dual-mode output strategy is one of the most mature aspects of the project.

### Notable Observation

The UI contains PDF and Excel export buttons, but the default implementation currently shows toast notifications unless specific export callbacks are passed. In report language, this means the export affordance exists in the interface, but a generalized export engine is not yet fully implemented.

---

# SYSTEM TESTING

Testing in the repository is primarily implementation-oriented and manual-flow oriented rather than full automated end-to-end testing. The Android directory contains default sample test scaffolding, but the application logic itself is largely validated through runtime behavior, build checks, and controlled UI logic.

**Table 9. System Testing Matrix**

| Test ID | Test Scenario | Expected Result | Current Evidence |
| --- | --- | --- | --- |
| TC-01 | Create a company with valid details | Company is stored and listed | Implemented in Companies page logic |
| TC-02 | Create duplicate company name | Submission blocked with destructive toast | Implemented |
| TC-03 | Enter invalid GSTN length | Validation error shown | Implemented |
| TC-04 | Create bill with required fields | Bill saved and due date auto-generated | Implemented |
| TC-05 | Add payment within balance | Paid and balance update immediately | Implemented |
| TC-06 | Add payment exceeding bill amount | Overpayment blocked | Implemented |
| TC-07 | Edit payment amount | Bill totals recompute correctly | Implemented |
| TC-08 | Delete payment | Payment removed and totals recompute | Implemented |
| TC-09 | Add personal expense | Expense appears in summaries and tables | Implemented |
| TC-10 | Generate ledger print | A4 ledger layout opens and prints | Implemented |
| TC-11 | Set PIN on Android | PIN payload stored securely | Implemented |
| TC-12 | Unlock using biometrics where available | App unlocks on successful verification | Implemented |
| TC-13 | Export backup | JSON backup file created | Implemented |
| TC-14 | Restore backup | Data overwritten and app reloads | Implemented |
| TC-15 | Run production build | Project compiles successfully | Should be verified during build execution |

### Testing Strategy Discussion

The most appropriate testing strategy for this project includes:

1. Unit tests for bill normalization and PIN verification helpers.
2. Integration tests for forms and storage behavior.
3. UI tests for payment and expense workflows.
4. Native device tests for biometric and file-picker plugins.
5. Print preview verification for ledger output.

### Current Testing Risks

1. Since the system is local-first, browser storage edge cases should be tested carefully.
2. Backup restore should be tested with malformed JSON and partial keys.
3. Company soft-linking should be tested when company names are edited after bill creation.
4. The bill table currently labels one column as due date while the displayed value is actually bill age in days. This is a UI consistency issue worth correcting in future iterations.

---

# CONCLUSION AND FUTURE WORK

VEE Agency is a well-structured, practical financial application that solves a real operational problem for small and medium businesses: fragmented billing, payment follow-up, expense visibility, and ledger readiness. The system demonstrates strong value through its local-first architecture, route-based modular organization, reusable component design, and integrated business logic for balance management. It is especially effective for a single-operator or small-team environment that needs fast access to billing data without investing in backend infrastructure.

The project is also technically interesting because it goes beyond a typical CRUD interface. It includes native Android security, encrypted storage, biometric verification, backup and restore, and print-grade ledger generation. These features make the application useful in practical field conditions, not just as a demonstration UI.

Future work can significantly expand the system:

1. Introduce a backend API and centralized database for multi-device synchronization.
2. Replace soft company matching with strict relational linkage and migration support.
3. Add role-based access control and multi-user accounts.
4. Implement inventory, product, and invoice line-item management.
5. Build real PDF and spreadsheet export pipelines.
6. Add tax calculation, GST invoice workflows, and reminder automation.
7. Introduce automated test coverage for business rules and UI workflows.
8. Add cloud backup and audit logging for enterprise readiness.

---

# APPENDIX 1

## Data Dictionary Snapshot

### Bill

- `id`: unique client-generated identifier
- `billNo`: bill number or deal identifier
- `name`: company or customer display name
- `companyId`: optional hard reference to company master
- `billAmount`: original billed amount
- `paid`: sum of payments recorded
- `balance`: remaining receivable
- `status`: billing state, generally `paid` or `pending`
- `dateCreated`: bill creation date
- `dueDate`: computed due date
- `payments`: embedded payment array

### Payment

- `id`: unique payment identifier
- `amount`: payment value
- `date`: payment date
- `note`: optional remark

### Company

- `id`: unique company identifier
- `companyName`: formal business name
- `ownerName`: owner or primary contact
- `gstn`: GST registration number
- `address`: postal address
- `phoneNumber`: contact number
- `createdAt`: creation timestamp
- `updatedAt`: update timestamp

### Expense

- `id`: unique expense identifier
- `category`: expense category
- `description`: explanatory text
- `amount`: spending amount
- `date`: expense date

### App Lock Settings

- `version`: payload version
- `fingerprintEnabled`: biometric unlock preference

### App Lock PIN Payload

- `version`: payload version
- `saltB64`: random salt
- `hashB64`: derived PIN hash
- `iterations`: PBKDF2 iteration count

---

# APPENDIX 2

## Route and Component Mapping

| Route | Primary Page | Main Purpose |
| --- | --- | --- |
| `/` | Dashboard | Overall financial summary |
| `/business` | Business | Company-wise business overview |
| `/business/company/:companyId` | BusinessCompanyDetail | Company account detail and transactions |
| `/companies` | Companies | Master data maintenance |
| `/ledger` | Ledger | Dedicated ledger print page |
| `/personal` | Personal | Expense management |
| `/reports` | Reports | Visual analytics |
| `/settings` | Settings | Security and backup |

## Important Source Files Used for This Report

1. `src/App.tsx`
2. `src/hooks/useBusinessBills.ts`
3. `src/hooks/useLocalStorageState.ts`
4. `src/pages/Business.tsx`
5. `src/pages/BusinessCompanyDetail.tsx`
6. `src/pages/Companies.tsx`
7. `src/pages/Personal.tsx`
8. `src/pages/Reports.tsx`
9. `src/pages/Settings.tsx`
10. `src/security/useAppLock.ts`
11. `src/security/AppLockGate.tsx`
12. `src/security/pin.ts`
13. `src/security/native.ts`
14. `src/components/business/LedgerPrintLayout.tsx`
15. `android/app/src/main/java/com/expensecompass/app/plugins/SecureStorePlugin.java`
16. `android/app/src/main/java/com/expensecompass/app/plugins/BiometricAuthPlugin.java`

---

# REFERENCES

1. Project README and package manifest: `README.md`, `package.json`
2. Core technical documentation: `BILLING_ENTERPRISE_MANAGEMENT_SYSTEM_DOCUMENTATION.md`
3. Design documentation: `PROJECT_COMPLETE_TECHNICAL_DOCUMENTATION.md`
4. Business module documentation: `BUSINESS_PAGE_FUNCTIONS_DOCUMENTATION.md`
5. Ledger implementation documentation: `IMPLEMENTATION_SUMMARY.md`, `LEDGER_DOCUMENTATION.md`, `LEDGER_SETUP.md`, `LEDGER_README.md`
6. Source implementation files in `src/` and `android/`

---

# MAPPING OF PROJECT GOALS TO SDG

**Table 10. Mapping of Project Goals to SDG**

| Project Goal | Related Project Feature | SDG | Justification |
| --- | --- | --- | --- |
| Improve small-business financial efficiency | Bill tracking, payment reconciliation, dashboard summaries | SDG 8: Decent Work and Economic Growth | Helps enterprises manage receivables and operational cash flow more effectively |
| Promote digital business modernization | React SPA, Android packaging, structured data workflows | SDG 9: Industry, Innovation and Infrastructure | Encourages technology adoption and process modernization |
| Reduce wasteful and unclear spending | Expense categorization and reporting | SDG 12: Responsible Consumption and Production | Improves visibility into spending behavior and financial discipline |
| Strengthen traceability and accountability | Ledger printouts, structured histories, backup records | SDG 16: Peace, Justice and Strong Institutions | Supports record integrity, traceability, and procedural accountability |

### SDG Discussion

The strongest SDG alignment is with SDG 8 and SDG 9 because the project directly supports business productivity and digital transformation. Its reporting, ledger, and backup features also contribute indirectly to more responsible governance and operational transparency.
