export interface Invoice {
  id: string; company_id: string; tenant_id: string; lease_id: string;
  invoice_number: string; invoice_date: string; due_date: string;
  period_start: string; period_end: string;
  subtotal: string; discount: string; tax: string; total: string;
  amount_paid: string; balance: string;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  notes: string | null; created_at: string; updated_at: string;
}

export interface InvoiceItem {
  id: string; invoice_id: string; description: string; item_type: string;
  quantity: string; unit_price: string; amount: string; created_at: string;
}
