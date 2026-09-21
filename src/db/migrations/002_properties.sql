CREATE TABLE rental_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES rental_companies(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) NOT NULL,
  property_type VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  county VARCHAR(100),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, code)
);

CREATE TABLE rental_buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES rental_properties(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) NOT NULL,
  floors INTEGER CHECK (floors IS NULL OR floors >= 0),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(property_id, code)
);

CREATE TABLE rental_unit_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES rental_companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 0 CHECK (bedrooms >= 0),
  bathrooms NUMERIC(4,1) NOT NULL DEFAULT 0 CHECK (bathrooms >= 0),
  description TEXT,
  UNIQUE(company_id, code)
);

CREATE TABLE rental_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES rental_buildings(id) ON DELETE CASCADE,
  unit_type_id UUID REFERENCES rental_unit_types(id) ON DELETE SET NULL,
  unit_number VARCHAR(50) NOT NULL,
  floor INTEGER,
  monthly_rent NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (monthly_rent >= 0),
  deposit_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'VACANT'
    CHECK (status IN ('VACANT', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'INACTIVE')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(building_id, unit_number)
);

CREATE INDEX idx_properties_company ON rental_properties(company_id);
CREATE INDEX idx_buildings_property ON rental_buildings(property_id);
CREATE INDEX idx_units_building ON rental_units(building_id);
CREATE INDEX idx_units_status ON rental_units(status);
