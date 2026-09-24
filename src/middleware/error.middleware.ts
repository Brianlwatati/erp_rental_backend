import { Request, Response, NextFunction } from "express";

const known: Record<string, [number, string]> = {
  PROPERTY_NOT_FOUND: [404, "Property not found"],
  BUILDING_NOT_FOUND: [404, "Building not found"],
  UNIT_NOT_FOUND: [404, "Unit not found"],
  UNIT_TYPE_NOT_FOUND: [404, "Unit type not found"],
  TENANT_NOT_FOUND: [404, "Tenant not found"],
  TENANT_DOCUMENT_NOT_FOUND: [404, "Tenant document not found"],
  LEASE_NOT_FOUND: [404, "Lease not found"],
  LEASE_NOT_FOUND_OR_ALREADY_TERMINATED: [409, "Lease not found or already terminated"],
  LEASE_CHARGE_NOT_FOUND: [404, "Lease charge not found"],
  LEASE_TENANT_MISMATCH: [409, "The lease does not belong to the specified tenant"],
  INVOICE_NOT_FOUND: [404, "Invoice not found"],
  INVOICE_ITEM_NOT_FOUND: [404, "Invoice item not found"],
  INVOICE_NOT_EDITABLE: [409, "Only draft invoices can be modified or deleted"],
  INVOICE_NOT_DRAFT: [409, "Only draft invoices can be issued"],
  INVOICE_HAS_PAYMENTS: [409, "Cannot cancel an invoice that has payments applied to it"],
  INVOICE_TENANT_MISMATCH: [409, "The invoice does not belong to the payment tenant"],
  INVOICE_NOT_PAYABLE: [409, "Invoice is not in a payable state"],
  PAYMENT_NOT_FOUND: [404, "Payment not found"],
  PAYMENT_NOT_POSTED: [409, "Payment is not in a postable state"],
  PAYMENT_HAS_RECEIPT: [409, "Cannot reverse a payment that already has a receipt"],
  RECEIPT_NOT_FOUND: [404, "Receipt not found"],
  RECEIPT_ALREADY_EXISTS: [409, "A receipt has already been issued for this payment"],
  ALLOCATION_EXCEEDS_BALANCE: [422, "Allocation amount exceeds the invoice balance"],
  ALLOCATION_EXCEEDS_PAYMENT: [422, "Allocation amount exceeds the unallocated payment amount"],
  EXPENSE_CATEGORY_NOT_FOUND: [404, "Expense category not found"],
  VENDOR_NOT_FOUND: [404, "Vendor not found"],
  EXPENSE_NOT_FOUND: [404, "Expense not found"],
  MAINTENANCE_REQUEST_NOT_FOUND: [404, "Maintenance request not found"],
  MAINTENANCE_REQUEST_CLOSED: [409, "Maintenance request is already completed or cancelled"],
  MAINTENANCE_COST_NOT_FOUND: [404, "Maintenance cost not found"],
};

export function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const err = error as { message?: string; code?: string; name?: string };
  console.error(`[${req.requestId ?? "no-request-id"}]`, error);

  const match = err.message ? known[err.message] : undefined;
  if (match) {
    const [status, message] = match;
    return res.status(status).json({ success: false, message, requestId: req.requestId });
  }

  switch (err.code) {
    case "22P02":
      return res.status(400).json({ success: false, message: "Invalid identifier or parameter", requestId: req.requestId });
    case "22001":
      return res.status(422).json({ success: false, message: "One or more values are too long", requestId: req.requestId });
    case "23505":
      return res.status(409).json({ success: false, message: "A record with the same unique value already exists", requestId: req.requestId });
    case "23503":
      return res.status(409).json({ success: false, message: "This record cannot be deleted because it is referenced by another record", requestId: req.requestId });
    case "23514":
      return res.status(422).json({ success: false, message: "The supplied value violates a business rule", requestId: req.requestId });
    case "23502":
      return res.status(422).json({ success: false, message: "A required value is missing", requestId: req.requestId });
    case "40001":
    case "40P01":
      return res.status(409).json({ success: false, message: "The operation conflicted with another transaction. Please retry.", requestId: req.requestId });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Invalid or expired access token", requestId: req.requestId });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    requestId: req.requestId,
  });
}
