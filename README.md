# Rental Management Backend

REST API for managing rental properties, buildings, units, tenants, leases, billing, payments, expenses, vendors, and maintenance requests.

## Stack

- Node.js
- TypeScript
- Express 5
- PostgreSQL
- Zod validation
- JWT authentication

## Requirements

- Node.js 20 or newer
- PostgreSQL 14 or newer
- An access token issued with the configured JWT secret, issuer, and audience

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
copy .env.example .env
```

On macOS or Linux, use `cp .env.example .env` instead.

3. Configure `.env`:

```env
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1
DATABASE_URL=postgresql://postgres:password@localhost:5432/rental_management
JWT_ACCESS_SECRET=replace-with-the-access-token-signing-secret
JWT_ISSUER=auth-service
JWT_AUDIENCE=auth-api
CORS_ORIGIN=http://localhost:3000
```

`JWT_ACCESS_SECRET` must match the secret used by the authentication service. `JWT_ISSUER` defaults to `auth-service` and `JWT_AUDIENCE` defaults to `auth-api` when omitted.

4. Create or update the database:

```bash
npm run db:migrate
npm run db:seed
```

5. Start the development server:

```bash
npm run dev
```

The API listens on `http://localhost:5000` by default.

## Scripts

| Command              | Description                                      |
| -------------------- | ------------------------------------------------ |
| `npm run dev`        | Start the development server with file watching  |
| `npm run build`      | Compile TypeScript to `dist/`                    |
| `npm start`          | Start the compiled server                        |
| `npm run db:migrate` | Apply pending SQL migrations                     |
| `npm run db:seed`    | Seed default expense categories for each company |

## Authentication

All routes below `API_PREFIX` require a bearer access token:

```http
Authorization: Bearer <access-token>
```

The token must contain a UUID `sub` and `companyId`, plus the role fields expected by the authentication middleware. All data access is scoped to the authenticated `companyId`.

Health check:

```http
GET /health
```

API root:

```http
GET /api/v1/
```

## Response format

Successful responses use:

```json
{
  "success": true,
  "data": {}
}
```

Errors use:

```json
{
  "success": false,
  "message": "Error message"
}
```

Validation errors additionally include an `errors` array and return HTTP `422`.

## API routes

All routes use the `/api/v1` prefix unless `API_PREFIX` is changed.

### Overview

```http
GET /api/v1/overview
```

Returns company-level dashboard metrics:

```json
{
  "totalProperties": 0,
  "totalBuildings": 0,
  "totalUnits": 0,
  "occupiedUnits": 0,
  "occupancyRate": 0,
  "totalTenants": 0,
  "totalRevenue": 0,
  "totalExpenses": 0,
  "netIncome": 0,
  "pendingMaintenance": 0
}
```

Revenue excludes cancelled invoices. Expenses include posted expenses. Pending maintenance includes requests with `OPEN`, `ASSIGNED`, or `IN_PROGRESS` status.

### Properties

```http
GET    /api/v1/properties
GET    /api/v1/properties/:id
POST   /api/v1/properties
PATCH  /api/v1/properties/:id
DELETE /api/v1/properties/:id
```

### Buildings

```http
GET    /api/v1/buildings/property/:propertyId
POST   /api/v1/buildings/property/:propertyId
GET    /api/v1/buildings/:id
PATCH  /api/v1/buildings/:id
DELETE /api/v1/buildings/:id
```

### Unit types

```http
GET    /api/v1/unit-types
GET    /api/v1/unit-types/:id
POST   /api/v1/unit-types
PATCH  /api/v1/unit-types/:id
DELETE /api/v1/unit-types/:id
```

### Units

```http
GET    /api/v1/units/building/:buildingId
POST   /api/v1/units/building/:buildingId
GET    /api/v1/units/:id
PATCH  /api/v1/units/:id
DELETE /api/v1/units/:id
```

### Tenants

```http
GET    /api/v1/tenants?status=ACTIVE|INACTIVE|BLACKLISTED
GET    /api/v1/tenants/:id
POST   /api/v1/tenants
PATCH  /api/v1/tenants/:id
DELETE /api/v1/tenants/:id

GET    /api/v1/tenants/:tenantId/documents
POST   /api/v1/tenants/:tenantId/documents
DELETE /api/v1/tenants/documents/:id
```

### Leases

```http
GET    /api/v1/leases?status=&tenantId=&unitId=
GET    /api/v1/leases/:id
POST   /api/v1/leases
PATCH  /api/v1/leases/:id
POST   /api/v1/leases/:id/terminate
DELETE /api/v1/leases/:id

GET    /api/v1/leases/:leaseId/charges
POST   /api/v1/leases/:leaseId/charges
DELETE /api/v1/leases/charges/:id
```

Only one `ACTIVE` lease per unit is allowed.

### Invoices

```http
GET    /api/v1/invoices?status=&tenantId=&leaseId=
GET    /api/v1/invoices/notfully-paid
GET    /api/v1/invoices/:id
POST   /api/v1/invoices
PATCH  /api/v1/invoices/:id
POST   /api/v1/invoices/:id/issue
POST   /api/v1/invoices/:id/cancel
DELETE /api/v1/invoices/:id

GET    /api/v1/invoices/:invoiceId/items
POST   /api/v1/invoices/:invoiceId/items
DELETE /api/v1/invoices/items/:id
```

`/invoices/notfully-paid` returns only invoices with status `DRAFT`, `ISSUED`, `PARTIALLY_PAID`, or `OVERDUE`. Invoice totals are calculated from line items, discount, tax, and payments. A blank or omitted invoice number is generated automatically.

### Payments and receipts

```http
GET    /api/v1/payments?status=&tenantId=
GET    /api/v1/payments/:id
POST   /api/v1/payments
POST   /api/v1/payments/:id/allocate
POST   /api/v1/payments/:id/reverse
DELETE /api/v1/payments/:id

POST   /api/v1/payments/:id/receipt
GET    /api/v1/payments/receipts
GET    /api/v1/payments/receipts/:id
```

### Expense categories

```http
GET    /api/v1/expense-categories
GET    /api/v1/expense-categories/:id
POST   /api/v1/expense-categories
PATCH  /api/v1/expense-categories/:id
DELETE /api/v1/expense-categories/:id
```

### Vendors

```http
GET    /api/v1/rental-vendors
GET    /api/v1/rental-vendors/:id
POST   /api/v1/rental-vendors
PATCH  /api/v1/rental-vendors/:id
DELETE /api/v1/rental-vendors/:id
```

### Expenses

```http
GET    /api/v1/expenses?status=&propertyId=&categoryId=
GET    /api/v1/expenses/:id
POST   /api/v1/expenses
PATCH  /api/v1/expenses/:id
DELETE /api/v1/expenses/:id
```

### Maintenance requests

```http
GET    /api/v1/maintenance-requests?status=&unitId=&propertyId=
GET    /api/v1/maintenance-requests/:id
POST   /api/v1/maintenance-requests
PATCH  /api/v1/maintenance-requests/:id
POST   /api/v1/maintenance-requests/:id/assign
POST   /api/v1/maintenance-requests/:id/start
POST   /api/v1/maintenance-requests/:id/complete
POST   /api/v1/maintenance-requests/:id/cancel
DELETE /api/v1/maintenance-requests/:id

GET    /api/v1/maintenance-requests/:requestId/costs
POST   /api/v1/maintenance-requests/:requestId/costs
DELETE /api/v1/maintenance-requests/costs/:id
```

## Important business rules

- Every read and write is scoped to the authenticated company.
- Cross-company records are not accessible.
- Only draft invoices can be edited or deleted.
- Invoice totals, balances, and payment status are maintained by the backend.
- Payment allocations cannot exceed the payment's unallocated amount or invoice balance.
- Reversing a payment reverses its invoice allocations.
- Lease, invoice, payment, receipt, and expense document numbers are generated when omitted.
- Deleting a referenced record may be rejected by database foreign-key constraints.

## Project structure

```text
src/
  app.ts                 Express application and middleware
  server.ts              HTTP server lifecycle
  config/                Environment and PostgreSQL configuration
  controllers/           HTTP request handlers
  db/                    Migrations and seed script
  middleware/             Authentication, authorization, validation, errors
  repositories/          Database queries
  routes/                Express route modules
  schemas/               Zod request schemas
  services/              Business rules and transactions
  types/                 TypeScript domain types
  utils/                 Shared response and number utilities
```

## Database migrations

Migrations are read from `src/db/migrations`, sorted by filename, and recorded in the `schema_migrations` table. New migrations should use the next numeric filename and be applied with:

```bash
npm run db:migrate
```

## License

This project is private and intended for internal use.

## Production hardening

The current backend includes:

- strict JWT secret configuration and CORS allowlisting
- Helmet, request-size limits, rate limiting, request IDs and safe error responses
- PostgreSQL readiness/liveness checks
- graceful HTTP/database shutdown and PostgreSQL pool error handling
- route-level create/update/delete authorization
- server-derived audit identities instead of trusting `createdBy`/`issuedBy` from clients
- cross-company reference checks for related rental records
- transaction row locks for payment/invoice allocation operations

See `README-PRODUCTION.md` for deployment notes and the next recommended backend phase.
