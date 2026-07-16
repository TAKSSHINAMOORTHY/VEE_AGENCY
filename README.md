# VEE Agency / Expense Compass

VEE Agency is a finance tracking app for managing business bills and personal expenses in one place. It provides a dashboard overview, bill tracking, personal expense tracking, reports, settings, and a ledger-focused workflow.

## Features

- Dashboard with quick financial summaries
- Business bill management
- Personal expense tracking
- Company and bill detail views
- Reports and settings pages
- Ledger/print-oriented documentation and workflows
- Web app built with Vite + React + TypeScript
- Mobile support via Capacitor
- Windows desktop wrapper using Electron

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- Capacitor
- Electron (Windows desktop build)

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- npm or Bun

### Install dependencies

```bash
npm install
```

### Run the web app

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - start the Vite development server
- `npm run build` - build the app for production
- `npm run build:dev` - build using development mode
- `npm run lint` - run ESLint
- `npm run preview` - preview the production build
- `npm run android:sync` - build and sync the Android project
- `npm run android:open` - open the Android project
- `npm run android:apk` - create a debug APK
- `npm run android:run` - build and run on Android
- `npm run launch` - open the interactive launcher

## Windows Desktop App

The repository includes a Windows desktop wrapper in the `windows/` folder.

### Run locally on Windows

```bash
cd windows
npm install
npm run prepare:web
npm run start
```

### Build Windows executable

```bash
cd windows
npm run dist:win
```

The output executable is created in `windows/release/VEE-Agency-v1.exe`.

## Project Structure

- `src/` - main React application code
- `public/` - static assets
- `android/` - Capacitor Android project
- `mobile/` - mobile-related assets or configuration
- `windows/` - Electron desktop wrapper
- `scripts/` - helper scripts and launchers
- `README.md` - project overview
- `LEDGER_*.md` - ledger documentation and guides

## Main Routes

- `/` - Dashboard
- `/business` - business bills
- `/business/company/:companyId` - company details
- `/business/company/:companyId/bill/:billId` - bill details
- `/companies` - company list
- `/ledger` - ledger view
- `/personal` - personal expenses
- `/reports` - reports
- `/settings` - settings

## Credits

**Taksshinamoorthy VT**  
**taksshinamoorthy@gmail.com**  
**6380332692**

## Notes

- The app uses local storage for some personal expense data.
- It supports both web and native-style workflows.
- Several ledger documentation files are included for setup, usage, and advanced customization.

## License

No license file was found in the repository.