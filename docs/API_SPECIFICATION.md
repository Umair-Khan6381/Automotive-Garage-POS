# Garage POS — API Specification

Base URL: `http://localhost:5000/api`

## Authentication Header
Except for `/api/auth/login`, all endpoints require:
```text
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

## Standard Response Envelope
```json
{
  "success": true,
  "message": "Description of action",
  "data": {},
  "timestamp": "2026-09-28T12:00:00.000Z"
}
```

## Endpoints Summary
| Module | Method | Path | Access |
| :--- | :--- | :--- | :--- |
| **Auth** | POST | `/api/auth/login` | Public (Rate Limited) |
| **Auth** | GET | `/api/auth/me` | Authenticated |
| **Auth** | GET | `/api/auth/users` | Owner |
| **Auth** | POST | `/api/auth/users` | Owner |
| **Customers** | GET | `/api/customers` | Staff |
| **Customers** | POST | `/api/customers` | Staff |
| **Vehicles** | GET | `/api/vehicles` | Staff |
| **Vehicles** | POST | `/api/vehicles` | Staff |
| **Products** | GET | `/api/products` | Staff |
| **Products** | POST | `/api/products` | Manager / Owner |
| **Products** | POST | `/api/products/:id/adjust` | Manager / Owner |
| **Jobs** | GET | `/api/jobs` | Staff |
| **Jobs** | POST | `/api/jobs` | Staff |
| **Jobs** | POST | `/api/jobs/:id/parts` | Staff |
| **Invoices** | GET | `/api/invoices` | Staff |
| **Invoices** | POST | `/api/invoices` | Staff |
| **Expenses** | GET | `/api/expenses` | Staff |
| **Expenses** | POST | `/api/expenses` | Manager / Owner |
| **Reports** | GET | `/api/reports/profit` | Manager / Owner |
| **Dashboard**| GET | `/api/dashboard/stats` | Staff |
| **Backup** | GET | `/api/backup/export` | Owner |
| **Backup** | POST | `/api/backup/restore` | Owner |
