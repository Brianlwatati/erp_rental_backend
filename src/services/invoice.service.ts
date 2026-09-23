import * as repo from "../repositories/invoice.repository";
import { query, withTransaction } from "../config/database";
import { generateDocumentNumber } from "../utils/number-generator";

async function verifyLeaseAndTenant(
  c: string,
  leaseId: string,
  tenantId: string,
) {
  const lease = (
    await query(
      "SELECT id, tenant_id FROM rental_leases WHERE id=$1 AND company_id=$2",
      [leaseId, c],
    )
  ).rows[0];
  if (!lease) throw new Error("LEASE_NOT_FOUND");
  const tenant = (
    await query("SELECT id FROM rental_tenants WHERE id=$1 AND company_id=$2", [
      tenantId,
      c,
    ])
  ).rows[0];
  if (!tenant) throw new Error("TENANT_NOT_FOUND");
  if (lease.tenant_id !== tenantId) throw new Error("LEASE_TENANT_MISMATCH");
}

export const listInvoicesNotFullyPaid = (
  c: string,
  filters: { tenantId?: string; leaseId?: string },
) => repo.findInvoicesNotFullyPaid(c, filters);

export const listInvoices = (
  c: string,
  filters: { status?: string; tenantId?: string; leaseId?: string },
) => repo.findInvoices(c, filters);

export async function getInvoice(c: string, id: string) {
  const invoice = await repo.findInvoiceById(c, id);
  if (!invoice) throw new Error("INVOICE_NOT_FOUND");
  const items = await repo.findInvoiceItems(id);
  return { ...invoice, items };
}

export async function createInvoice(c: string, d: any) {
  await verifyLeaseAndTenant(c, d.leaseId, d.tenantId);
  return withTransaction(async (client) => {
    const invoice = await repo.createInvoiceHeader(
      c,
      { ...d, invoiceNumber: d.invoiceNumber ?? generateDocumentNumber("INV") },
      client,
    );
    for (const item of d.items) {
      await repo.createInvoiceItem(invoice.id, item, client);
    }
    const finalInvoice = await repo.recomputeInvoiceTotals(invoice.id, client);
    const items = await repo.findInvoiceItems(invoice.id, client);
    return { ...finalInvoice, items };
  });
}

export async function updateInvoice(c: string, id: string, d: any) {
  return withTransaction(async (client) => {
    const existing = await repo.findInvoiceById(c, id, client);
    if (!existing) throw new Error("INVOICE_NOT_FOUND");
    if (existing.status !== "DRAFT") throw new Error("INVOICE_NOT_EDITABLE");
    await repo.updateInvoiceFields(c, id, d, client);
    const updated = await repo.recomputeInvoiceTotals(id, client);
    const items = await repo.findInvoiceItems(id, client);
    return { ...updated, items };
  });
}

export async function issueInvoice(c: string, id: string) {
  const existing = await repo.findInvoiceById(c, id);
  if (!existing) throw new Error("INVOICE_NOT_FOUND");
  if (existing.status !== "DRAFT") throw new Error("INVOICE_NOT_DRAFT");
  return repo.setInvoiceStatus(c, id, "ISSUED");
}

export async function cancelInvoice(c: string, id: string) {
  const existing = await repo.findInvoiceById(c, id);
  if (!existing) throw new Error("INVOICE_NOT_FOUND");
  if (Number(existing.amount_paid) > 0) throw new Error("INVOICE_HAS_PAYMENTS");
  const x = await repo.setInvoiceStatus(c, id, "CANCELLED");
  if (!x) throw new Error("INVOICE_NOT_FOUND");
  return x;
}

export async function deleteInvoice(c: string, id: string) {
  const existing = await repo.findInvoiceById(c, id);
  if (!existing) throw new Error("INVOICE_NOT_FOUND");
  if (existing.status !== "DRAFT") throw new Error("INVOICE_NOT_EDITABLE");
  const x = await repo.deleteInvoice(c, id);
  if (!x) throw new Error("INVOICE_NOT_FOUND");
  return x;
}

export async function listInvoiceItems(c: string, invoiceId: string) {
  const invoice = await repo.findInvoiceById(c, invoiceId);
  if (!invoice) throw new Error("INVOICE_NOT_FOUND");
  return repo.findInvoiceItems(invoiceId);
}

export async function addInvoiceItem(c: string, invoiceId: string, d: any) {
  return withTransaction(async (client) => {
    const invoice = await repo.findInvoiceById(c, invoiceId, client);
    if (!invoice) throw new Error("INVOICE_NOT_FOUND");
    if (invoice.status !== "DRAFT") throw new Error("INVOICE_NOT_EDITABLE");
    await repo.createInvoiceItem(invoiceId, d, client);
    const updated = await repo.recomputeInvoiceTotals(invoiceId, client);
    const items = await repo.findInvoiceItems(invoiceId, client);
    return { ...updated, items };
  });
}

export async function deleteInvoiceItem(c: string, id: string) {
  return withTransaction(async (client) => {
    const item = await repo.findInvoiceItemById(c, id, client);
    if (!item) throw new Error("INVOICE_ITEM_NOT_FOUND");
    const invoice = await repo.findInvoiceById(c, item.invoice_id, client);
    if (invoice.status !== "DRAFT") throw new Error("INVOICE_NOT_EDITABLE");
    await repo.deleteInvoiceItemRow(id, client);
    const updated = await repo.recomputeInvoiceTotals(item.invoice_id, client);
    const items = await repo.findInvoiceItems(item.invoice_id, client);
    return { ...updated, items };
  });
}
