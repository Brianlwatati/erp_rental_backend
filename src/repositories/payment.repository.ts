import { pool, query } from '../config/database';

type Executor = { query: typeof pool.query };
const exec = (e?: Executor) => e ?? pool;

export async function findPayments(companyId: string, filters: { status?: string; tenantId?: string }) {
  const clauses = ['company_id=$1'];
  const params: unknown[] = [companyId];
  if (filters.status) { params.push(filters.status); clauses.push(`status=$${params.length}`); }
  if (filters.tenantId) { params.push(filters.tenantId); clauses.push(`tenant_id=$${params.length}`); }
  return (await query(`SELECT * FROM rental_payments WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC`, params)).rows;
}
export async function findPaymentById(companyId: string, id: string, e?: Executor) {
  return (await exec(e).query('SELECT * FROM rental_payments WHERE company_id=$1 AND id=$2', [companyId, id])).rows[0] ?? null;
}
export async function createPayment(companyId: string, d: any, e: Executor) {
  return (await e.query(
    `INSERT INTO rental_payments(company_id,tenant_id,payment_number,payment_date,amount,payment_method,reference_number,notes,status)
     VALUES($1,$2,$3,COALESCE($4,CURRENT_DATE),$5,$6,$7,$8,'POSTED') RETURNING *`,
    [companyId, d.tenantId, d.paymentNumber, d.paymentDate ?? null, d.amount, d.paymentMethod, d.referenceNumber ?? null, d.notes ?? null]
  )).rows[0];
}
export async function setPaymentStatus(companyId: string, id: string, status: string, e?: Executor) {
  return (await exec(e).query('UPDATE rental_payments SET status=$3 WHERE company_id=$1 AND id=$2 RETURNING *', [companyId, id, status])).rows[0] ?? null;
}
export async function deletePayment(companyId: string, id: string) {
  return (await query('DELETE FROM rental_payments WHERE company_id=$1 AND id=$2 RETURNING id', [companyId, id])).rows[0] ?? null;
}

export async function findAllocations(paymentId: string, e?: Executor) {
  return (await exec(e).query('SELECT * FROM rental_payment_allocations WHERE payment_id=$1 ORDER BY created_at', [paymentId])).rows;
}
export async function sumAllocations(paymentId: string, e: Executor) {
  const r = await e.query('SELECT COALESCE(SUM(amount),0) AS total FROM rental_payment_allocations WHERE payment_id=$1', [paymentId]);
  return Number(r.rows[0].total);
}
export async function createAllocation(paymentId: string, invoiceId: string, amount: number, e: Executor) {
  return (await e.query(
    `INSERT INTO rental_payment_allocations(payment_id,invoice_id,amount) VALUES($1,$2,$3) RETURNING *`,
    [paymentId, invoiceId, amount]
  )).rows[0];
}
export async function deleteAllocationsForPayment(paymentId: string, e: Executor) {
  return (await e.query('DELETE FROM rental_payment_allocations WHERE payment_id=$1 RETURNING *', [paymentId])).rows;
}

export async function findReceiptByPaymentId(companyId: string, paymentId: string, e?: Executor) {
  return (await exec(e).query('SELECT * FROM rental_receipts WHERE company_id=$1 AND payment_id=$2', [companyId, paymentId])).rows[0] ?? null;
}
export async function findReceiptById(companyId: string, id: string) {
  return (await query('SELECT * FROM rental_receipts WHERE company_id=$1 AND id=$2', [companyId, id])).rows[0] ?? null;
}
export async function findReceipts(companyId: string) {
  return (await query('SELECT * FROM rental_receipts WHERE company_id=$1 ORDER BY created_at DESC', [companyId])).rows;
}
export async function createReceipt(companyId: string, paymentId: string, amount: number, d: any, e: Executor) {
  return (await e.query(
    `INSERT INTO rental_receipts(company_id,payment_id,receipt_number,amount,issued_by,notes)
     VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
    [companyId, paymentId, d.receiptNumber, amount, d.issuedBy ?? null, d.notes ?? null]
  )).rows[0];
}
