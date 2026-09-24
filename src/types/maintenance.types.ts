export interface MaintenanceRequest {
  id: string;
  company_id: string;
  property_id: string;
  unit_id: string | null;
  tenant_id: string | null;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  reported_at: string;
  resolved_at: string | null;
  assigned_vendor_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceCost {
  id: string;
  maintenance_request_id: string;
  vendor_id: string | null;
  description: string;
  amount: string;
  expense_id: string | null;
  created_at: string;
}
