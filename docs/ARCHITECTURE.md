# Garage POS & Workshop Management — System Architecture

## Architecture Overview

```text
┌───────────────────────────┐         ┌───────────────────────────┐
│   Desktop Client (Electron)│         │  Mobile Client (Capacitor)│
│   Windows / macOS / Linux │         │     Android & iOS Phone   │
└─────────────┬─────────────┘         └─────────────┬─────────────┘
              │                                     │
              │  HTTP / REST JSON (JWT Auth)        │
              └──────────────────┬──────────────────┘
                                 │
                                 ▼
              ┌─────────────────────────────────────┐
              │      Dedicated Backend Server       │
              │         (Node.js + Express)         │
              │                                     │
              │  [Routes] ──► [Middleware]          │
              │  [Controllers] ──► [Services]       │
              │  [Repositories] ──► [Prisma ORM]    │
              └──────────────────┬──────────────────┘
                                 │
                                 ▼
              ┌─────────────────────────────────────┐
              │      Local SQLite Database File     │
              │      (dev.db / garage.db)           │
              └─────────────────────────────────────┘
```

## Principles
1. **Single Source of Truth**: All state, inventory deduction, and financial profit calculations live exclusively on the backend.
2. **Client Decoupling**: Desktop and Mobile applications only render UI and communicate via standard JSON REST endpoints.
3. **Offline Reliability**: SQLite provides immediate local database storage without remote cloud latency or external database servers.
