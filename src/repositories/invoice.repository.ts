import { pool, query } from '../config/database';

type Executor = { query: typeof pool.query };
const exec = (e?: Executor) => e ?? pool;

export async function findInvoices(companyId: string, filters: { status?: string; tenantId?: string; leaseId?: string }) {
  const clauses = ['company_id=$1'];
  const params: unknown[] = [companyId];
  if (filters.status) { params.push(filters.status); clauses.push(`status=$${params.length}`); }
  if (filters.tenantId) { params.push(filters.tenantId); clauses.push(`tenant_id=$${params.length}`); }
  if (filters.leaseId) { params.push(filters.leaseId); clauses.push(`lease_id=$${params.length}`); }
  return (await query(`SELECT * FROM rental_invoices WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC`, params)).rows;
}
export async function findInvoiceById(companyId: string, id: string, e?: Executor) {
  return (await exec(e).query('SELECT * FROM rental_invoices WHERE company_id=$1 AND id=$2', [companyId, id])).rows[0] ?? null;
}
export async function findInvoiceItems(invoiceId: string, e?: Executor) {
  return (await exec(e).query('SELECT * FROM rental_invoice_items WHERE invoice_id=$1 ORDER BY created_at', [invoiceId])).rows;
}
export async function createInvoiceHeader(companyId: string, d: any, e: Executor) {
  return (await e.query(
    `INSERT INTO rental_invoices(company_id,tenant_id,lease_id,invoice_number,invoice_date,due_date,period_start,period_end,discount,tax,status)
     VALUES($1,$2,$3,$4,COALESCE($5,CURRENT_DATE),$6,$7,$8,$9,$10,'DRAFT') RETURNING *`,
    [companyId, d.tenantId, d.leaseId, d.invoiceNumber, d.invoiceDate ?? null, d.dueDate, d.periodStart, d.periodEnd, d.discount ?? 0, d.tax ?? 0]
  )).rows[0];
}
export async function createInvoiceItem(invoiceId: string, item: any, e: Executor) {
  const amount = item.amount ?? Number(item.quantity ?? 1) * Number(item.unitPrice);
  return (await e.query(
    `INSERT INTO rental_invoice_items(invoice_id,description,item_type,quantity,unit_price,amount)
     VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
    [invoiceId, item.description, item.itemType, item.quantity ?? 1, item.unitPrice, amount]
  )).rows[0];
}
export async function deleteInvoiceItemRow(id: string, e: Executor) {
  return (await e.query('DELETE FROM rental_invoice_items WHERE id=$1 RETURNING invoice_id', [id])).rows[0] ?? null;
}
export async function findInvoiceItemById(companyId: string, id: string, e?: Executor) {
  return (await exec(e).query(
    `SELECT ii.* FROM rental_invoice_items ii JOIN rental_invoices i ON i.id=ii.invoice_id WHERE i.company_id=$1 AND ii.id=$2`,
    [companyId, id]
  )).rows[0] ?? null;
}
export async function recomputeInvoiceTotals(invoiceId: string, e: Executor) {
  return (await e.query(
    `UPDATE rental_invoices i SET
       subtotal = COALESCE((SELECT SUM(amount) FROM rental_invoice_items WHERE invoice_id=i.id), 0),
       total = GREATEST(COALESCE((SELECT SUM(amount) FROM rental_invoice_items WHERE invoice_id=i.id), 0) - i.discount + i.tax, 0),
       balance = GREATEST(GREATEST(COALESCE((SELECT SUM(amount) FROM rental_invoice_items WHERE invoice_id=i.id), 0) - i.discount + i.tax, 0) - i.amount_paid, 0),
       status = CASE
         WHEN i.status IN ('CANCELLED') THEN i.status
         WHEN i.amount_paid > 0 AND GREATEST(GREATEST(COALESCE((SELECT SUM(amount) FROM rental_invoice_items WHERE invoice_id=i.id), 0) - i.discount + i.tax, 0) - i.amount_paid, 0) <= 0 THEN 'PAID'
         WHEN i.amount_paid > 0 THEN 'PARTIALLY_PAID'
         WHEN i.status = 'DRAFT' THEN 'DRAFT'
         ELSE i.status
       END,
       updated_at = NOW()
     WHERE i.id=$1 RETURNING i.*`,
    [invoiceId]
  )).rows[0];
}
export async function updateInvoiceFields(companyId: string, id: string, d: any, e: Executor) {
  return (await e.query(
    `UPDATE rental_invoices SET due_date=COALESCE($3,due_date),period_start=COALESCE($4,period_start),
      period_end=COALESCE($5,period_end),discount=COALESCE($6,discount),tax=COALESCE($7,tax),notes=COALESCE($8,notes),updated_at=NOW()
     WHERE company_id=$1 AND id=$2 RETURNING *`,
    [companyId, id, d.dueDate, d.periodStart, d.periodEnd, d.discount, d.tax, d.notes]
  )).rows[0] ?? null;
}
export async function adjustInvoiceAmountPaid(invoiceId: string, delta: number, e: Executor) {
  return (await e.query(
    `UPDATE rental_invoices SET amount_paid = GREATEST(amount_paid + $2, 0), updated_at=NOW() WHERE id=$1 RETURNING *`,
    [invoiceId, delta]
  )).rows[0];
}
export async function setInvoiceStatus(companyId: string, id: string, status: string, e?: Executor) {
  return (await exec(e).query(
    `UPDATE rental_invoices SET status=$3, updated_at=NOW() WHERE company_id=$1 AND id=$2 RETURNING *`,
    [companyId, id, status]
  )).rows[0] ?? null;
}
export async function deleteInvoice(companyId: string, id: string) {
  return (await query('DELETE FROM rental_invoices WHERE company_id=$1 AND id=$2 RETURNING id', [companyId, id])).rows[0] ?? null;
}
