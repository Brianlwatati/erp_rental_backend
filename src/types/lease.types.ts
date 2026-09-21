export interface Lease {
  id: string; company_id: string; unit_id: string; tenant_id: string;
  lease_number: string; start_date: string; end_date: string | null;
  monthly_rent: string; deposit_amount: string; billing_day: number;
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  termination_date: string | null; termination_reason: string | null;
  notes: string | null; created_at: string; updated_at: string;
}

export interface LeaseCharge {
  id: string; lease_id: string; name: string; charge_type: string;
  amount: string; recurring: boolean; created_at: string;
}
