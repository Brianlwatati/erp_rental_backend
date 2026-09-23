CREATE TABLE rental_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR(36) NOT NULL ,
  tenant_id UUID NOT NULL REFERENCES rental_tenants(id) ON DELETE RESTRICT,
  lease_id UUID NOT NULL REFERENCES rental_leases(id) ON DELETE RESTRICT,
  invoice_number VARCHAR(100) NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  tax NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  amount_paid NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  balance NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, invoice_number),
  CHECK (period_end >= period_start)
);

CREATE TABLE rental_invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES rental_invoices(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  item_type VARCHAR(50) NOT NULL,
  quantity NUMERIC(12,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(14,2) NOT NULL CHECK (unit_price >= 0),
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_company ON rental_invoices(company_id);
CREATE INDEX idx_invoices_tenant ON rental_invoices(tenant_id);
CREATE INDEX idx_invoices_lease ON rental_invoices(lease_id);
CREATE INDEX idx_invoices_due_date ON rental_invoices(due_date);
CREATE INDEX idx_invoices_status ON rental_invoices(status);
CREATE INDEX idx_invoice_items_invoice ON rental_invoice_items(invoice_id);
