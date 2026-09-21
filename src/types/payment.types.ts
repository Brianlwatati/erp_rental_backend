export interface Payment {
  id: string; company_id: string; tenant_id: string; payment_number: string;
  payment_date: string; amount: string;
  payment_method: 'CASH' | 'BANK' | 'MPESA' | 'CARD' | 'CHEQUE' | 'OTHER';
  reference_number: string | null; notes: string | null;
  status: 'PENDING' | 'POSTED' | 'REVERSED' | 'CANCELLED';
  created_at: string;
}

export interface PaymentAllocation {
  id: string; payment_id: string; invoice_id: string; amount: string; created_at: string;
}

export interface Receipt {
  id: string; company_id: string; payment_id: string; receipt_number: string;
  receipt_date: string; amount: string; issued_by: string | null; notes: string | null;
  created_at: string;
}
