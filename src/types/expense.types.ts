export interface ExpenseCategory {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
}

export interface Vendor {
  id: string;
  company_id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  service_type: string | null;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
}

export interface Expense {
  id: string;
  company_id: string;
  property_id: string | null;
  property_name: string | null;
  property_code: string | null;
  building_id: string | null;
  building_name: string | null;
  building_code: string | null;
  unit_id: string | null;
  unit_number: string | null;
  expense_category_id: string | null;
  vendor_id: string | null;
  expense_number: string;
  description: string;
  amount: string;
  expense_date: string;
  payment_method: string | null;
  reference_number: string | null;
  status: "DRAFT" | "POSTED" | "CANCELLED";
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
