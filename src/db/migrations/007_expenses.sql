CREATE TABLE rental_expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES rental_companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'INACTIVE')),
  UNIQUE(company_id, code)
);

CREATE TABLE rental_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES rental_companies(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(200),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  service_type VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rental_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES rental_companies(id) ON DELETE CASCADE,
  property_id UUID REFERENCES rental_properties(id) ON DELETE SET NULL,
  building_id UUID REFERENCES rental_buildings(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES rental_units(id) ON DELETE SET NULL,
  expense_category_id UUID REFERENCES rental_expense_categories(id) ON DELETE RESTRICT,
  vendor_id UUID REFERENCES rental_vendors(id) ON DELETE SET NULL,
  expense_number VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(30),
  reference_number VARCHAR(150),
  status VARCHAR(20) NOT NULL DEFAULT 'POSTED'
    CHECK (status IN ('DRAFT', 'POSTED', 'CANCELLED')),
  created_by UUID REFERENCES rental_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, expense_number)
);

CREATE INDEX idx_expenses_company ON rental_expenses(company_id);
CREATE INDEX idx_expenses_property ON rental_expenses(property_id);
CREATE INDEX idx_expenses_category ON rental_expenses(expense_category_id);
CREATE INDEX idx_expenses_date ON rental_expenses(expense_date);
