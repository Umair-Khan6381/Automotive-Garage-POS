# Automotive Garage POS & Workshop Management System (Dubai, UAE)

A production-grade, full-stack management platform engineered for automobile repair garages and workshops in Dubai, UAE. Built with a clean separation of concerns between **Frontend** (React + TypeScript + Vite + Tailwind CSS) and **Backend** (Node.js + Express + Prisma + SQLite/MongoDB).

---

## 1. Project Structure

```
Automotive-Garage-POS/
├── frontend/                     # Standalone Client-Side Application
│   ├── public/                   # Static assets, favicon, webmanifest, robots.txt
│   ├── src/
│   │   ├── assets/               # Branding graphics & UI illustrations
│   │   ├── components/           # Modular garage UI views & modals (POS, Jobs, Invoices, etc.)
│   │   ├── pages/                # High-level page views (Dashboard, POS, Invoices, Labour, etc.)
│   │   ├── layouts/              # Navbar, Sidebar, BottomNav responsive wrappers
│   │   ├── hooks/                # Custom hooks (useShop, useAuth, useCurrency)
│   │   ├── services/             # Dedicated API service layer (api.ts)
│   │   ├── utils/                # Currency formatting (AED), UAE VAT, date helpers
│   │   ├── styles/               # Global typography & Tailwind styling
│   │   ├── context/              # Centralized ShopContext state engine
│   │   ├── data/                 # Clean garage seed configurations (0 dummy records)
│   │   ├── types/                # TypeScript interface contracts
│   │   ├── App.tsx               # Primary application router & layout orchestrator
│   │   └── main.tsx              # React DOM entry point
│   ├── package.json              # Frontend dependencies and npm scripts
│   ├── index.html                # Single-page application entry point
│   ├── vite.config.ts            # Vite bundler & proxy configuration
│   ├── tsconfig.json             # TypeScript compiler options
│   └── .env.example              # Client-side environment variables template
│
├── backend/                      # Standalone Server-Side REST API
│   ├── src/
│   │   ├── config/               # Environment & system configurations
│   │   ├── controllers/          # Business logic handlers (auth, customers, jobs, invoices, etc.)
│   │   ├── routes/               # Modular Express API routers
│   │   ├── services/             # Data processing & profit margin calculations
│   │   ├── middleware/           # JWT auth, RBAC permissions, audit logger, error handling
│   │   ├── models/               # Domain data structures & validation schemas
│   │   ├── database/             # Prisma client connection manager
│   │   ├── utils/                # Logging, bcrypt hashing, JWT generators
│   │   ├── validators/           # Request body validation rules
│   │   ├── app.ts                # Express application factory & middleware setup
│   │   └── server.ts             # Standalone HTTP server startup script
│   ├── database/                 # Database schema, seeders, and backup scripts
│   │   ├── schema.sql            # SQLite DDL schema (with foreign keys & indexes)
│   │   ├── seed.ts               # Clean database initialization script
│   │   ├── seed-data.json        # Initial master configuration snapshot
│   │   ├── backup-db.ts          # Automated JSON/SQL snapshot generator
│   │   └── backups/              # Directory for database snapshots
│   ├── uploads/                  # Private storage for receipts and payment proofs
│   ├── tests/                    # Backend unit & integration test suite (28 passing tests)
│   │   └── run-tests.ts          # Automated financial and RBAC validation suite
│   ├── prisma/                   # Prisma schema & generator definitions
│   │   ├── schema.prisma         # Database model definitions
│   │   └── seed.ts               # Prisma seed script
│   ├── package.json              # Backend dependencies and npm scripts
│   ├── tsconfig.json             # TypeScript compiler options
│   └── .env.example              # Server environment variables template
│
├── .gitignore                    # Git exclusions (node_modules, credentials, .db files)
└── README.md                     # Comprehensive setup, execution & deployment guide
```

---

## 2. Quick Start & Independent Commands

### Backend Application

Navigate to the `backend/` directory:

```bash
cd backend
```

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   ```
   *(Update `DATABASE_URL` with your SQLite file or MongoDB connection string).*

3. **Initialize Database & Seed Master Owner:**
   ```bash
   npm run db:seed
   ```
   *Creates the initial Dubai workshop settings and master owner account (`umair` / `umair123#`) with **0 dummy business records**.*

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   *Server starts at `http://localhost:5000` with hot-reloading.*

5. **Run Backend Tests:**
   ```bash
   npm test
   ```
   *Runs all 28 automated unit tests verifying password hashing, inventory weighted average cost (WAC), stock deductions, labour billing, and net profit margins.*

6. **Build & Start for Production:**
   ```bash
   npm run build
   npm start
   ```

---

### Frontend Application

Navigate to the `frontend/` directory in a new terminal:

```bash
cd frontend
```

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   ```
   *Set `VITE_API_BASE_URL="http://localhost:5000/api"` if running the backend separately, or leave blank to use the Vite proxy.*

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   *Access the application at `http://localhost:3000`.*

4. **Build for Production:**
   ```bash
   npm run build
   ```
   *Output compiled to `dist/` ready for static hosting.*

---

## 3. Communication & Security Architecture

1. **Decoupled API Client (`frontend/src/services/api.ts`):**
   - The frontend communicates with the backend exclusively via REST endpoints using `fetch`.
   - The API base URL is dynamically read from `import.meta.env.VITE_API_BASE_URL` with fallback to `/api`.
   - All authenticated requests automatically include the `Authorization: Bearer <jwt_token>` header.

2. **CORS & Origin Control (`backend/src/app.ts`):**
   - Configured to allow communication from `http://localhost:3000` and production domains.
   - Credentials (cookies, authorization headers) are explicitly allowed.

3. **Role-Based Access Control (RBAC):**
   - **Owner:** Full system privileges (staff management, financial reports, profit & loss, settings, backups).
   - **Manager:** Job cards, POS billing, customer records, inventory, and expense logging.
   - **Employee:** View assigned jobs, update repair checklists, and clock in labour hours.
   - *Public user registration is disabled by default to keep the application private to your garage.*

4. **Dubai Garage Regional Settings:**
   - **Currency:** AED (United Arab Emirates Dirham) formatted with standard 2 decimal places.
   - **Tax:** 5.0% UAE VAT applied across spare parts and labour billing.
   - **Timezone:** Asia/Dubai consistency across invoices, receipts, and audit logs.

---

## 4. Database Safety & Backup

- **SQLite DDL Schema (`backend/database/schema.sql`):** Contains table structures, foreign keys, and indexes for `garage_settings`, `users`, `customers`, `vehicles`, `products`, `job_cards`, `invoices`, `labour_workers`, and `expenses`.
- **Database Backup Script (`backend/database/backup-db.ts`):**
  ```bash
  npm run db:backup
  ```
  Exports a full JSON snapshot of all current garage records to `backend/database/backups/`.
- **Zero Dummy Data Guarantee:** The database initialization creates **only** the owner account and shop settings. All dashboard metrics (revenue, profit, inventory value) are calculated from genuine database records.

---

## 5. Master Owner Default Credentials

- **Username:** `umair`
- **Password:** `umair123#`
- **Role:** Owner (Master Administrator)
- *Change your password immediately after first login via **Settings -> Security**.*
