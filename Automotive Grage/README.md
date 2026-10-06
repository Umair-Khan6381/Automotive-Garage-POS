# Automotive Garage (Apex Auto POS & Workshop Management)

This repository contains the complete Automotive Workshop Management platform separated into dedicated `backend` and `frontend` sub-folders.

```
Automotive Grage/
├── backend/                  # Server-side REST API & Database engine
│   ├── src/                  # Express controllers, services, routes, repositories, middleware
│   ├── prisma/               # Prisma schema & seed scripts
│   ├── tests/                # Test suites
│   ├── package.json          # Backend dependencies & scripts
│   ├── tsconfig.json         # Backend TypeScript configuration
│   ├── .env.example          # Sample backend environment variables
│   └── README.md             # Backend architecture documentation
│
└── frontend/                 # Client-side Workshop Management & POS Web App
    ├── src/                  # React 19 components, context, hooks, types
    ├── index.html            # HTML entry point
    ├── vite.config.ts        # Vite configuration with Tailwind CSS v4
    ├── tsconfig.json         # Frontend TypeScript configuration
    ├── package.json          # Frontend dependencies & scripts
    ├── vercel.json           # Vercel deployment configuration
    ├── .env.example          # Frontend environment variables
    └── README.md             # Frontend documentation
```

---

## 🚀 Getting Started

### 1. Backend Setup (`/backend`)
```bash
cd backend

# Install dependencies
npm install

# Setup database (Prisma)
npm run db:generate
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```
*Backend runs on port `5000` (or `PORT` specified in `.env`).*

---

### 2. Frontend Setup (`/frontend`)
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
*Frontend runs on port `3000` via Vite.*

---

### 3. Production Build

#### Backend Build:
```bash
cd backend
npm run build
npm start
```

#### Frontend Build:
```bash
cd frontend
npm run build
# Output will be located in frontend/dist/
```

#### Deployment to Vercel:
The `frontend/` folder contains a pre-configured `vercel.json` with SPA routing rewrites and asset caching headers.
