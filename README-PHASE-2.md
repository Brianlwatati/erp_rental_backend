# RMS Phase 2 — Property Management API

Full CRUD APIs for the rental management platform: properties, buildings, units,
tenants, leases, billing (invoices), payments, expenses, and maintenance.

## Temporary company scope

Until authentication is implemented, requests require:

`x-company-id: <company UUID>`

This is temporary and will be replaced by the authenticated JWT company scope.
Every endpoint below is scoped to the company in this header — records belonging
to other companies are never visible or editable.

## Response shape

Success: `{ "success": true, "data": ... }`
Error: `{ "success": false, "message": "..." }` (validation errors also include an `errors` array)

---

## Properties
```
GET    /api/v1/properties
GET    /api/v1/properties/:id
POST   /api/v1/properties
PATCH  /api/v1/properties/:id
DELETE /api/v1/properties/:id
```

## Buildings
```
GET    /api/v1/buildings/property/:propertyId
POST   /api/v1/buildings/property/:propertyId
GET    /api/v1/buildings/:id
PATCH  /api/v1/buildings/:id
DELETE /api/v1/buildings/:id
```

## Units
```
GET    /api/v1/units/building/:buildingId
POST   /api/v1/units/building/:buildingId
GET    /api/v1/units/:id
PATCH  /api/v1/units/:id
DELETE /api/v1/units/:id
```

## Tenants
```
GET    /api/v1/tenants                        ?status=ACTIVE|INACTIVE|BLACKLISTED
GET    /api/v1/tenants/:id
POST   /api/v1/tenants
PATCH  /api/v1/tenants/:id
DELETE /api/v1/tenants/:id

GET    /api/v1/tenants/:tenantId/documents
POST   /api/v1/tenants/:tenantId/documents
DELETE /api/v1/tenants/documents/:id
```

## Leases
```
GET    /api/v1/leases                         ?status=&tenantId=&unitId=
GET    /api/v1/leases/:id
POST   /api/v1/leases                         (validates unit + tenant belong to company;
                                                sets the unit to OCCUPIED when the lease is ACTIVE)
PATCH  /api/v1/leases/:id
POST   /api/v1/leases/:id/terminate           { terminationDate, terminationReason? }
                                               (sets unit back to VACANT)
DELETE /api/v1/leases/:id

GET    /api/v1/leases/:leaseId/charges
POST   /api/v1/leases/:leaseId/charges
DELETE /api/v1/leases/charges/:id
```
Only one ACTIVE lease per unit is allowed (enforced by a partial unique index in the database).

## Invoices (billing)
```
GET    /api/v1/invoices                       ?status=&tenantId=&leaseId=
GET    /api/v1/invoices/:id                   (includes line items)
POST   /api/v1/invoices                       { tenantId, leaseId, dueDate, periodStart, periodEnd,
                                                 discount?, tax?, notes?, items: [{description,itemType,quantity?,unitPrice}] }
                                               (subtotal/total/balance computed from items; starts as DRAFT)
PATCH  /api/v1/invoices/:id                   (DRAFT invoices only)
POST   /api/v1/invoices/:id/issue             DRAFT -> ISSUED
POST   /api/v1/invoices/:id/cancel            (only if nothing has been paid yet)
DELETE /api/v1/invoices/:id                   (DRAFT invoices only)

GET    /api/v1/invoices/:invoiceId/items
POST   /api/v1/invoices/:invoiceId/items      (recomputes invoice totals)
DELETE /api/v1/invoices/items/:id             (recomputes invoice totals)
```

## Payments & Receipts
```
GET    /api/v1/payments                       ?status=&tenantId=
GET    /api/v1/payments/:id                   (includes allocations + receipt)
POST   /api/v1/payments                       { tenantId, amount, paymentMethod, referenceNumber?, notes?,
                                                 allocations?: [{invoiceId, amount}] }
                                               (allocations are optional and applied atomically at creation)
POST   /api/v1/payments/:id/allocate          { invoiceId, amount } — allocate remaining payment to an invoice;
                                               updates the invoice's amount_paid/balance/status
POST   /api/v1/payments/:id/reverse           (unwinds allocations and marks the payment REVERSED;
                                               blocked once a receipt has been issued)
DELETE /api/v1/payments/:id

POST   /api/v1/payments/:id/receipt           { receiptNumber?, notes?, issuedBy? } — one receipt per payment
GET    /api/v1/payments/receipts
GET    /api/v1/payments/receipts/:id
```

## Expense categories
```
GET    /api/v1/expense-categories
GET    /api/v1/expense-categories/:id
POST   /api/v1/expense-categories
PATCH  /api/v1/expense-categories/:id
DELETE /api/v1/expense-categories/:id
```

## Vendors
```
GET    /api/v1/vendors
GET    /api/v1/vendors/:id
POST   /api/v1/vendors
PATCH  /api/v1/vendors/:id
DELETE /api/v1/vendors/:id
```

## Expenses
```
GET    /api/v1/expenses                       ?status=&propertyId=&categoryId=
GET    /api/v1/expenses/:id
POST   /api/v1/expenses
PATCH  /api/v1/expenses/:id
DELETE /api/v1/expenses/:id
```

## Maintenance requests
```
GET    /api/v1/maintenance-requests           ?status=&unitId=&propertyId=
GET    /api/v1/maintenance-requests/:id
POST   /api/v1/maintenance-requests           { propertyId, unitId?, tenantId?, title, description?, priority? }
PATCH  /api/v1/maintenance-requests/:id
POST   /api/v1/maintenance-requests/:id/assign    { vendorId } — OPEN/ASSIGNED -> ASSIGNED
POST   /api/v1/maintenance-requests/:id/start     -> IN_PROGRESS
POST   /api/v1/maintenance-requests/:id/complete  -> COMPLETED (sets resolved_at)
POST   /api/v1/maintenance-requests/:id/cancel    -> CANCELLED
DELETE /api/v1/maintenance-requests/:id

GET    /api/v1/maintenance-requests/:requestId/costs
POST   /api/v1/maintenance-requests/:requestId/costs
                                               { vendorId?, description, amount,
                                                 createExpense?, expenseCategoryId?, paymentMethod?, referenceNumber? }
                                               (createExpense: true also creates a linked rental_expenses row)
DELETE /api/v1/maintenance-requests/costs/:id
```

---

## Business rules enforced in the service layer

- All lookups/writes are scoped by `company_id` — cross-company access always 404s.
- A unit can only have one ACTIVE lease at a time (DB constraint); activating/terminating
  a lease keeps the unit's `status` (VACANT/OCCUPIED) in sync.
- Invoice `subtotal`, `total`, and `balance` are always derived from invoice items,
  discount, tax, and `amount_paid` — never trusted from client input.
- Invoices can only be edited or deleted while `DRAFT`; once `ISSUED`, only payments
  (via allocation) move them through `PARTIALLY_PAID` -> `PAID`.
- Payment allocations cannot exceed the invoice's remaining balance or the payment's
  unallocated amount. Reversing a payment un-applies its allocations from the invoices
  it touched.
- Document numbers (`lease_number`, `invoice_number`, `payment_number`, `receipt_number`,
  `expense_number`) are auto-generated (`PREFIX-YYYYMMDD-XXXX`) when not supplied.

## Setup
```
cp .env.example .env      # set DATABASE_URL, etc.
npm install
npm run db:migrate
npm run db:seed           # seeds default expense categories per company
npm run dev                # tsx watch src/server.ts
```
