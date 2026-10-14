# Garage POS & Workshop Management — Backend Server

A robust, production-style layered REST API built with **Node.js, TypeScript, Express.js, Prisma ORM, and SQLite** for a single private automotive garage.

---

## 1. Backend Layered Architecture

The backend strictly separates concerns across dedicated architectural layers:

```text
Request (HTTP)
   │
   ▼
[Routes] (/api/auth, /api/jobs, /api/inventory, /api/invoices, ...)
   │
   ▼
[Middleware] (Authentication, RBAC Roles, Rate Limiter, Audit Logger)
   │
   ▼
[Validators] (Customer, Vehicle, Product, Job, Invoice Validators)
   │
   ▼
[Controllers] (Request parsing, status codes, response formatting)
   │
   ▼
[Services] (Business rules, stock deduction, WAC cost, net profit)
   │
   ▼
[Repositories] (Prisma queries & data access abstraction)
   │
   ▼
[Prisma ORM / SQLite] (dev.db / garage.db)
```

* **No direct database queries inside route files.**
* **No business calculations inside controllers.**
* **All profit and stock calculations run exclusively on the server.**

---

## 2. Directory Layout

```text
backend/
├── src/
│   ├── config/             # Environment, JWT secrets, port configs
│   ├── controllers/        # Express route handlers
│   ├── database/           # Prisma client singleton instance
│   ├── middleware/         # Auth, Roles, ErrorHandler, RateLimiter, AuditLog
│   ├── models/             # Shared database models
│   ├── repositories/       # Isolated DB query repositories
│   ├── routes/             # REST route declarations
│   ├── services/           # Business logic & calculations (Profit, Stock, Payroll)
│   ├── types/              # Express Request/Response & DTO types
│   ├── utils/              # Security (bcrypt, JWT), Response formatters, Logger
│   ├── validators/         # Request validation logic
│   └── app.ts              # Express application factory & server entry point
│
├── prisma/
│   ├── schema.prisma       # Full relational schema (16 models)
│   └── seed.ts             # Initial master owner & factory seeder
│
├── tests/
│   └── run-tests.ts        # Automated unit and business logic test runner
│
├── .env.example            # Environment variables template
├── package.json            # Server dependencies and lifecycle scripts
├── tsconfig.json           # NodeNext TypeScript configuration
└── README.md               # Backend documentation
```

---

## 3. Quick Start & Local Setup

### Step 1: Navigate to the Backend Folder
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Step 4: Generate Prisma Client & Migrate SQLite DB
```bash
npm run db:generate
npm run db:migrate
```

### Step 5: Seed the Database
```bash
npm run db:seed
```
*Creates the Master Owner account (`umair` / `umair123#`), sample vehicles, parts, technicians, and invoices.*

### Step 6: Start Development Server
```bash
npm run dev
```
The server will start on `http://localhost:5000` with hot-reloading.

---

## 4. Lifecycle Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts server in watch mode via `tsx` |
| `npm run build` | Compiles TypeScript into `dist/` |
| `npm start` | Runs compiled production server (`node dist/app.js`) |
| `npm run db:generate` | Generates `@prisma/client` bindings |
| `npm run db:migrate` | Runs SQLite Prisma migrations |
| `npm run db:seed` | Populates database with default owner & seed records |
| `npm test` | Runs the automated business logic test suite |

---

## 5. API Reference

All endpoints return uniform JSON responses:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "timestamp": "2026-09-28T11:30:00.000Z"
}
```

### Authentication (`/api/auth`)
* `POST /api/auth/login` — Public login with username & password (rate-limited).
* `GET  /api/auth/me` — Returns currently authenticated staff profile.
* `GET  /api/auth/users` — *(Owner only)* List all workshop staff users.
* `POST /api/auth/users` — *(Owner only)* Create new Manager or Employee.
* `PATCH /api/auth/users/:id/status` — *(Owner only)* Enable/disable account.

### Customers & Vehicles (`/api/customers`, `/api/vehicles`)
* `GET  /api/customers` — List all customers with fleet counts.
* `POST /api/customers` — Create customer profile.
* `GET  /api/vehicles` — List registered customer vehicles.
* `POST /api/vehicles` — Register vehicle with license plate.

### Inventory & Spare Parts (`/api/products`, `/api/inventory`)
* `GET  /api/products` — List stock catalog with low-stock indicators.
* `POST /api/products` — *(Manager/Owner)* Add new spare part with SKU.
* `POST /api/products/:id/adjust` — Manual stock audit adjustment (+/-).
* `POST /api/products/purchases` — Record supplier PO (auto-recalculates Weighted Average Cost).
* `GET  /api/inventory/transactions` — Full inventory audit log trail.

### Repair Job Cards (`/api/jobs`)
* `GET  /api/jobs` — List all active and completed job cards.
* `POST /api/jobs` — Create repair order with complaint and odometer reading.
* `POST /api/jobs/:id/parts` — Add part used on job (auto-deducts stock).
* `POST /api/jobs/:id/labour` — Assign mechanic labour to job.
* `POST /api/jobs/:id/photos` — Attach inspection damage photo.

### Invoices & Counter POS (`/api/invoices`, `/api/pos`)
* `GET  /api/invoices` — List all invoices.
* `POST /api/invoices` — Create invoice (POS direct billing or job conversion).
* `POST /api/invoices/:id/payments` — Record payment receipt (Cash, Card, Bank).

### Profit & Financial Statements (`/api/reports`)
* `GET  /api/reports/profit` — Calculates real-time **Monthly Profit Breakdown** and **Grand Profit (All Months)** directly from invoice items and overhead expenses.

### Dashboard & Auditing (`/api/dashboard`, `/api/backup`)
* `GET  /api/dashboard/stats` — Live workshop metrics, receivables, and active jobs.
* `GET  /api/backup/export` — *(Owner only)* Complete database JSON snapshot.
* `POST /api/backup/restore` — *(Owner only)* Restore database archive.

---

## 6. Running Tests
Run the standalone automated tests:
```bash
npm test
```
Verifies password hashing, token verification, stock deduction, weighted average cost, and server profit calculations.
