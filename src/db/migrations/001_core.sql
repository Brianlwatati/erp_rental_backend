CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE rental_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  registration_number VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Kenya',
  currency CHAR(3) NOT NULL DEFAULT 'KES',
  timezone VARCHAR(100) NOT NULL DEFAULT 'Africa/Nairobi',
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rental_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR(36) NOT NULL ,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, code)
);

CREATE TABLE rental_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE rental_role_permissions (
  role_id UUID NOT NULL REFERENCES rental_roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES rental_permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE rental_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR(36) NOT NULL ,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  password_hash TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, email)
);

CREATE TABLE rental_user_roles (
  user_id UUID NOT NULL REFERENCES rental_users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES rental_roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE rental_refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES rental_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rental_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL ,
  user_id UUID REFERENCES rental_users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rental_users_company ON rental_users(company_id);
CREATE INDEX idx_rental_refresh_tokens_user ON rental_refresh_tokens(user_id);
CREATE INDEX idx_rental_audit_company ON rental_audit_logs(company_id);
