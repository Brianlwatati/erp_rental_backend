CREATE INDEX idx_properties_company_status
  ON rental_properties(company_id, status);

CREATE INDEX idx_units_building_status
  ON rental_units(building_id, status);

CREATE INDEX idx_tenants_company_status
  ON rental_tenants(company_id, status);

CREATE INDEX idx_leases_company_status
  ON rental_leases(company_id, status);

CREATE INDEX idx_invoices_company_status_due
  ON rental_invoices(company_id, status, due_date);

CREATE INDEX idx_payments_company_status_date
  ON rental_payments(company_id, status, payment_date);

CREATE INDEX idx_expenses_company_date
  ON rental_expenses(company_id, expense_date);
