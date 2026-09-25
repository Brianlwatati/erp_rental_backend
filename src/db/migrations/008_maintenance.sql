CREATE TABLE rental_maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR(36) NOT NULL ,
  property_id UUID NOT NULL REFERENCES rental_properties(id) ON DELETE RESTRICT,
  building_id UUID  REFERENCES rental_buildings(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES rental_units(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES rental_tenants(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM'
    CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN'
    CHECK (status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  assigned_vendor_id UUID REFERENCES rental_vendors(id) ON DELETE SET NULL,
  created_by  VARCHAR(36) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rental_maintenance_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_request_id UUID NOT NULL REFERENCES rental_maintenance_requests(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES rental_vendors(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  expense_id UUID REFERENCES rental_expenses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_maintenance_company ON rental_maintenance_requests(company_id);
CREATE INDEX idx_maintenance_unit ON rental_maintenance_requests(unit_id);
CREATE INDEX idx_maintenance_status ON rental_maintenance_requests(status);
CREATE INDEX idx_maintenance_costs_request ON rental_maintenance_costs(maintenance_request_id);
