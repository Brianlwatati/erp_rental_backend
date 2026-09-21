CREATE TABLE rental_leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES rental_companies(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES rental_units(id) ON DELETE RESTRICT,
  tenant_id UUID NOT NULL REFERENCES rental_tenants(id) ON DELETE RESTRICT,
  lease_number VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  monthly_rent NUMERIC(14,2) NOT NULL CHECK (monthly_rent >= 0),
  deposit_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),
  billing_day INTEGER NOT NULL DEFAULT 1 CHECK (billing_day BETWEEN 1 AND 28),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED')),
  termination_date DATE,
  termination_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, lease_number),
  CHECK (end_date IS NULL OR end_date >= start_date),
  CHECK (termination_date IS NULL OR termination_date >= start_date)
);

CREATE INDEX idx_leases_company ON rental_leases(company_id);
CREATE INDEX idx_leases_unit ON rental_leases(unit_id);
CREATE INDEX idx_leases_tenant ON rental_leases(tenant_id);
CREATE INDEX idx_leases_status ON rental_leases(status);

CREATE UNIQUE INDEX uq_active_lease_per_unit
ON rental_leases(unit_id)
WHERE status = 'ACTIVE';

CREATE TABLE rental_lease_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID NOT NULL REFERENCES rental_leases(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  charge_type VARCHAR(50) NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  recurring BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lease_charges_lease ON rental_lease_charges(lease_id);
