# Automotive Garage Management & POS System

This project contains the complete Automotive Garage & Workshop Management platform, cleanly separated into **backend** and **frontend** subfolders with all testing/dummy data removed so you can input your own live records.

## Directory Structure

```
Automotive Grage/
├── README.md               # Overview and setup guide
│
├── backend/                # REST API & Database engine (Node.js, Express, Prisma)
│   ├── src/
│   │   ├── controllers/    # API Controllers (customers, vehicles, jobs, inventory, invoices)
│   │   ├── services/       # Business logic services
│   │   ├── routes/         # Express router endpoints
│   │   ├── middleware/     # Auth, role check, audit, error handler
│   │   └── database/       # Prisma client initialization
│   ├── prisma/
│   │   ├── schema.prisma   # PostgreSQL/SQLite relational schema
│   │   └── seed.ts         # Clean initializer (0 mock records)
│   ├── package.json        # Backend dependencies & scripts
│   ├── tsconfig.json       # TypeScript configuration
│   └── .env.example        # Environment variables template
│
└── frontend/               # Single-Page Web Application (React, TypeScript, Tailwind, Vite)
    ├── src/
    │   ├── components/     # UI Views (POS, Job Cards, Inventory, Invoices, Customers, etc.)
    │   ├── context/        # ShopContext state management
    │   ├── data/           # Clean initial data (0 dummy records)
    │   ├── db/             # Local database init scripts
    │   ├── types/          # TypeScript interface definitions
    │   └── utils/          # UAE VAT, currency, date, and calculation helpers
    ├── index.html          # Application entry point
    ├── vite.config.ts      # Vite bundler configuration
    ├── package.json        # Frontend dependencies & npm scripts
    ├── tsconfig.json       # TypeScript configuration
    ├── vercel.json         # Vercel deployment configuration
    └── .env.example        # Frontend environment variables template
```

## Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Owner Login Credentials
- **Username:** `umair`
- **Password:** `umair123#`
- **Role:** Owner / Master Administrator
