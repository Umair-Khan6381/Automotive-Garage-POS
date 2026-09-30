# Private Automotive Garage POS & Workshop Management System

> **A complete, production-quality, offline-first Desktop & Mobile POS and Workshop Management System designed exclusively for ONE private automotive garage.**

---

## 1. System Requirements

Ensure your computer has the following installed before running the project:

* **Node.js**: `v18.0.0` or higher (Recommended: LTS `v20.x` or `v22.x`)
* **Package Manager**: `npm` (comes with Node.js) or `yarn` / `pnpm`
* **Operating System**: Windows 10/11, macOS (Intel or Apple Silicon), or Linux (Ubuntu 20.04+)
* **Storage**: Minimum 500 MB free disk space for local SQLite database and media attachments
* **Optional Mobile Tools**:
  * **Android**: Android Studio & Android SDK (API Level 29+)
  * **iOS**: macOS with Xcode 15+ & CocoaPods

---

## 2. Installation & Quick Start

Follow these steps to extract and launch the system on any developer computer or garage workshop terminal:

### Step 1: Clone or Extract the Repository
```bash
# Clone the repository (or extract the downloaded ZIP file)
git clone <repository_url> garage-pos
cd garage-pos
```

### Step 2: Install Project Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the provided `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Default settings point to the local SQLite database `./garage.db` on port 3000)*

---

## 3. Database Initialization (SQLite)

Initialize the local SQLite database schema and seed the initial master owner and workshop data:

```bash
npm run db:init
```

This command:
1. Reads and executes the schema DDL from `src/db/init.sql`.
2. Creates the local SQLite database tables with foreign keys and indexes.
3. Provisions the default Master Owner account.
4. Generates `src/db/seed-data.json` for offline runtime hydration.

---

## 4. First-Time Setup & Authentication

The system operates strictly as a **Private Garage System**:
* **Public Signup**: Permanently disabled (no registration links for external users).
* **Customer Login**: Disabled. Only workshop personnel can access the application.

### Default Master Owner Account:
* **Username**: `umair` *(or email: `owner@example.com`)*
* **Password**: `umair123#`
* **Full Name**: `Umair Ullah`
* **Role**: `owner`

> **Note**: You can also use the one-click *"Fill Owner Credentials"* button directly on the login screen.

### Initial First-Time Setup Wizard:
If you need to configure a fresh workshop name, owner name, or currency, navigate to:
```
http://localhost:3000/#setup
```
Completing the setup locks the first-time installation and redirects to the secure login screen.

---

## 5. Development Mode

To start the local development server:

```bash
npm run dev
```

Open your browser at:
```
http://localhost:3000
```

The system operates **100% offline**. An active internet connection is **never** required for daily garage operations (customers, vehicles, job cards, POS, invoicing, stock deductions, or payroll).

---

## 6. Desktop Build (Windows & macOS via Electron)

The desktop application provides full window management, local file system persistence, and direct A4 receipt printing.

### Run Desktop in Development:
```bash
npm run desktop:dev
```

### Package Production Desktop Installer:
```bash
npm run desktop:build
```
* **Windows**: Generates `.exe` installer in `dist_electron/`
* **macOS**: Generates `.dmg` installer in `dist_electron/`
* **Linux**: Generates `.AppImage` in `dist_electron/`

---

## 7. Android Mobile Build (Capacitor)

The mobile interface includes touch navigation, large 44px tap targets, a bottom navigation bar (`Home`, `Jobs`, `POS`, `Inventory`, `More`), and camera attachment support for vehicle inspection photos.

### Step 1: Build the Web Assets
```bash
npm run build
```

### Step 2: Sync Web Assets to Android Project
```bash
npx cap add android   # Only required on first run
npm run mobile:sync
```

### Step 3: Open in Android Studio & Compile APK
```bash
npm run mobile:android
```
In Android Studio: Click **Build → Build Bundle(s) / APK(s) → Build APK(s)** to generate `app-release.apk`.

---

## 8. iOS Mobile Build (Capacitor)

*(Requires macOS with Xcode installed)*

### Step 1: Build Web Assets & Sync
```bash
npm run build
npx cap add ios      # Only required on first run
npm run mobile:sync
```

### Step 2: Open in Xcode
```bash
npm run mobile:ios
```
In Xcode: Select your signing team and click **Product → Archive** or run directly on a connected iPhone or iPad.

---

## 9. Backup & Disaster Recovery

The system provides complete offline backup and restore features:

### Creating an Encrypted Backup:
1. Navigate to **Sidebar → System & Security → Backup & Restore** (or **Settings → Backup & Restore**).
2. Click **Create & Download Database Backup (.garagebak)**.
3. A timestamped `.garagebak` archive will be downloaded to your computer containing all customers, fleet vehicles, parts inventory, job cards, invoices, and audit logs.

### Restoring from Backup:
1. Only the **OWNER** can execute restore operations.
2. In **Backup & Restore**, click **Select Backup File to Restore...**
3. Select your `.garagebak` file.
4. The system will prompt:
   > *"Restoring a backup will replace the current garage data. Continue?"*
5. Confirm to replace and restore all database tables.

### Spreadsheet CSV Exports:
Export individual tables for accounting and tax records directly from the Backup console:
* `Customers & Fleet CSV`
* `Spare Parts & Stock CSV`
* `Invoices Ledger CSV`
* `Audit Logs CSV`

---

## 10. Key Business Workflows & Data Flow

```
Customer & Vehicle Record
        │
        ▼
   Repair Job Card ─────────────► Mobile Inspection Photos
        │
        ├───────────────────────► Parts Used (Auto-deducted from Inventory via WAC)
        │
        ├───────────────────────► Labour Assigned (Tracked against Worker Payroll)
        │
        ▼
 POS Counter / Final Invoice
        │
        ├───────────────────────► Payment Received (Cash, Card, Bank Transfer)
        │
        ▼
 Financial & Profit Ledger
   • Gross Profit = Revenue - Parts Cost
   • Net Profit   = Revenue - Parts Cost - Labour Cost - Shop Expenses
        │
        ▼
 Service History & Oil Change Due Date/Mileage Recalculated
```

---

## 11. Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `Port 3000 in use` | Another process is occupying port 3000. | Set `PORT=3001` in `.env` or run `npm run dev -- --port 3001`. |
| `sqlite3 / database locked` | Concurrency lock or permissions. | Check file permissions on `garage.db` or restart the dev server. |
| `First-time setup looping` | Browser LocalStorage cleared. | Sign in using default owner credentials (`umair` / `umair123#`). |
| `Electron build fails` | Missing OS build dependencies. | Run `npm install --save-dev electron electron-builder` and rerun `npm run desktop:build`. |
| `Capacitor sync error` | `dist` folder not generated. | Run `npm run build` first, then run `npm run mobile:sync`. |

---

## 12. Project File Structure

```
garage-pos/
├── src/
│   ├── components/
│   │   ├── audit/         # Audit logs & traceability
│   │   ├── auth/          # Login & First-time setup screens
│   │   ├── backup/        # Database backup, restore & CSV exports
│   │   ├── common/        # Global search modal & notification drawer
│   │   ├── customers/     # Customer management & spending ledger
│   │   ├── dashboard/     # Workshop overview, KPIs, and alerts
│   │   ├── inventory/     # Parts stock, suppliers, PO purchases & WAC
│   │   ├── invoices/      # A4 invoice view & payment modal
│   │   ├── jobs/          # Job cards, mechanics, parts & inspection photos
│   │   ├── labour/        # Technicians & labour payroll
│   │   ├── layout/        # Sidebar, Navbar, and Mobile Bottom Navigation
│   │   ├── oil/           # Oil change tracker (Upcoming, Due, Overdue)
│   │   ├── pos/           # Counter POS dual-panel fast billing
│   │   ├── reports/       # Financial, Profit, Inventory, and Sales reports
│   │   ├── settings/      # Workshop configuration & currency settings
│   │   ├── users/         # Staff accounts & RBAC management
│   │   └── vehicles/      # Vehicle fleet & timeline service history
│   ├── context/
│   │   └── ShopContext.tsx # Central business logic, offline sync & persistence
│   ├── data/
│   │   └── initialData.ts # Master owner constants & factory seed records
│   ├── db/
│   │   ├── init.sql       # SQLite DDL schema with indexes
│   │   ├── schema.ts      # TypeScript database entities
│   │   └── seed.ts        # Database seeder (npm run db:init)
│   ├── types/
│   │   └── index.ts       # Shared TypeScript types across modules
│   └── utils/
│       ├── calculations.ts # Profit, weighted average cost & tax calculations
│       ├── formatters.ts   # Currency, odometer mileage & date formatting
│       ├── security.ts     # PBKDF2 password hashing & brute-force limits
│       └── validation.ts   # Input validation for forms & records
├── electron/
│   ├── main.ts            # Electron desktop main process & PDF printing
│   └── preload.ts         # Secure contextBridge IPC
├── capacitor.config.ts    # Mobile configuration (Android & iOS)
├── .env.example           # Environment template
├── package.json           # Dependencies and build scripts
└── README.md              # Complete developer & operator documentation
```
