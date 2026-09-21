export interface Tenant {
  id: string; company_id: string; first_name: string; last_name: string;
  email: string | null; phone: string | null; national_id: string | null;
  address: string | null; emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED';
  created_at: string; updated_at: string;
}

export interface TenantDocument {
  id: string; tenant_id: string; document_type: string; document_name: string;
  document_url: string | null; expires_at: string | null; created_at: string;
}
