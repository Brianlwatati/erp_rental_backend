CREATE TABLE rental_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR(36) NOT NULL ,
  tenant_id UUID NOT NULL REFERENCES rental_tenants(id) ON DELETE RESTRICT,
  payment_number VARCHAR(100) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  payment_method VARCHAR(30) NOT NULL
    CHECK (payment_method IN ('CASH', 'BANK', 'MPESA', 'CARD', 'CHEQUE', 'OTHER')),
  reference_number VARCHAR(150),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'POSTED'
    CHECK (status IN ('PENDING', 'POSTED', 'REVERSED', 'CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, payment_number)
);

CREATE TABLE rental_payment_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES rental_payments(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES rental_invoices(id) ON DELETE RESTRICT,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(payment_id, invoice_id)
);

CREATE TABLE rental_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR(36) NOT NULL ,
  payment_id UUID NOT NULL UNIQUE REFERENCES rental_payments(id) ON DELETE RESTRICT,
  receipt_number VARCHAR(100) NOT NULL,
  receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  issued_by UUID REFERENCES rental_users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, receipt_number)
);

CREATE INDEX idx_payments_company ON rental_payments(company_id);
CREATE INDEX idx_payments_tenant ON rental_payments(tenant_id);
CREATE INDEX idx_payments_date ON rental_payments(payment_date);
CREATE INDEX idx_payment_allocations_payment ON rental_payment_allocations(payment_id);
CREATE INDEX idx_payment_allocations_invoice ON rental_payment_allocations(invoice_id);
