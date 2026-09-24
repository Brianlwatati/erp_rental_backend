import * as repo from "../repositories/payment.repository";
import * as invoiceRepo from "../repositories/invoice.repository";
import { query, withTransaction } from "../config/database";
import { generateDocumentNumber } from "../utils/number-generator";

async function verifyTenant(c: string, tenantId: string) {
  const r = await query(
    "SELECT id FROM rental_tenants WHERE id=$1 AND company_id=$2",
    [tenantId, c],
  );
  if (!r.rowCount) throw new Error("TENANT_NOT_FOUND");
}

export const listPayments = (
  c: string,
  filters: { status?: string; tenantId?: string },
) => repo.findPayments(c, filters);

export async function getPayment(c: string, id: string) {
  const payment = await repo.findPaymentById(c, id);
  if (!payment) throw new Error("PAYMENT_NOT_FOUND");
  const allocations = await repo.findAllocations(id);
  const receipt = await repo.findReceiptByPaymentId(c, id);
  return { ...payment, allocations, receipt };
}

async function applyAllocation(
  c: string,
  tenantId: string,
  paymentId: string,
  invoiceId: string,
  amount: number,
  client: any,
) {
  const invoice = await invoiceRepo.findInvoiceById(c, invoiceId, client);
  if (!invoice) throw new Error("INVOICE_NOT_FOUND");
  if (invoice.tenant_id !== tenantId)
    throw new Error("INVOICE_TENANT_MISMATCH");
  if (!["ISSUED", "PARTIALLY_PAID", "OVERDUE"].includes(invoice.status))
    throw new Error("INVOICE_NOT_PAYABLE");
  if (amount > Number(invoice.balance))
    throw new Error("ALLOCATION_EXCEEDS_BALANCE");
  await repo.createAllocation(paymentId, invoiceId, amount, client);
  await invoiceRepo.adjustInvoiceAmountPaid(invoiceId, amount, client);
  await invoiceRepo.recomputeInvoiceTotals(invoiceId, client);
}

export async function createPayment(c: string, d: any) {
  await verifyTenant(c, d.tenantId);
  const allocations = d.allocations ?? [];
  const totalAllocated = allocations.reduce(
    (sum: number, a: any) => sum + a.amount,
    0,
  );
  if (totalAllocated > d.amount) throw new Error("ALLOCATION_EXCEEDS_PAYMENT");

  return withTransaction(async (client) => {
    const payment = await repo.createPayment(
      c,
      { ...d, paymentNumber: d.paymentNumber ?? generateDocumentNumber("PMT") },
      client,
    );
    for (const a of allocations) {
      await applyAllocation(
        c,
        d.tenantId,
        payment.id,
        a.invoiceId,
        a.amount,
        client,
      );
    }
    const finalAllocations = await repo.findAllocations(payment.id, client);
    return { ...payment, allocations: finalAllocations };
  });
}

export async function allocatePayment(
  c: string,
  paymentId: string,
  d: { invoiceId: string; amount: number },
) {
  return withTransaction(async (client) => {
    const payment = await repo.findPaymentById(c, paymentId, client);
    if (!payment) throw new Error("PAYMENT_NOT_FOUND");
    if (payment.status !== "POSTED") throw new Error("PAYMENT_NOT_POSTED");
    const alreadyAllocated = await repo.sumAllocations(paymentId, client);
    if (alreadyAllocated + d.amount > Number(payment.amount))
      throw new Error("ALLOCATION_EXCEEDS_PAYMENT");
    await applyAllocation(
      c,
      payment.tenant_id,
      paymentId,
      d.invoiceId,
      d.amount,
      client,
    );
    const allocations = await repo.findAllocations(paymentId, client);
    return { ...payment, allocations };
  });
}

export async function reversePayment(c: string, id: string) {
  return withTransaction(async (client) => {
    const payment = await repo.findPaymentById(c, id, client);
    if (!payment) throw new Error("PAYMENT_NOT_FOUND");
    if (payment.status !== "POSTED") throw new Error("PAYMENT_NOT_POSTED");
    const existingReceipt = await repo.findReceiptByPaymentId(c, id, client);
    if (existingReceipt) throw new Error("PAYMENT_HAS_RECEIPT");
    const allocations = await repo.findAllocations(id, client);
    for (const a of allocations) {
      await invoiceRepo.adjustInvoiceAmountPaid(
        a.invoice_id,
        -Number(a.amount),
        client,
      );
      await invoiceRepo.recomputeInvoiceTotals(a.invoice_id, client);
    }
    await repo.deleteAllocationsForPayment(id, client);
    return repo.setPaymentStatus(c, id, "REVERSED", client);
  });
}

export async function deletePayment(c: string, id: string) {
  const x = await repo.deletePayment(c, id);
  if (!x) throw new Error("PAYMENT_NOT_FOUND");
  return x;
}

export async function issueReceipt(c: string, paymentId: string, d: any) {
  return withTransaction(async (client) => {
    const payment = await repo.findPaymentById(c, paymentId, client);
    if (!payment) throw new Error("PAYMENT_NOT_FOUND");
    if (payment.status !== "POSTED") throw new Error("PAYMENT_NOT_POSTED");
    const existing = await repo.findReceiptByPaymentId(c, paymentId, client);
    if (existing) throw new Error("RECEIPT_ALREADY_EXISTS");
    return repo.createReceipt(
      c,
      paymentId,
      Number(payment.amount),
      { ...d, receiptNumber: d.receiptNumber ?? generateDocumentNumber("RCT") },
      client,
    );
  });
}

export const listReceipts = (c: string) => repo.findReceipts(c);

export async function getReceipt(c: string, id: string) {
  const x = await repo.findReceiptById(c, id);
  if (!x) throw new Error("RECEIPT_NOT_FOUND");
  return x;
}
