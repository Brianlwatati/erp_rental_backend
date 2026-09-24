import { z } from "zod";

export const allocationInputSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
});

export const paymentCreateSchema = z.object({
  tenantId: z.string().uuid(),
  paymentNumber: z.string().min(1).max(100).optional(),
  paymentDate: z.string().date().optional(),
  amount: z.number().positive(),
  paymentMethod: z.enum(["CASH", "BANK", "MPESA", "CARD", "CHEQUE", "OTHER"]),
  referenceNumber: z.string().max(150).optional(),
  notes: z.string().max(2000).optional(),
  allocations: z.array(allocationInputSchema).optional(),
});

export const receiptCreateSchema = z.object({
  receiptNumber: z.string().min(1).max(100).optional(),
  notes: z.string().max(2000).optional(),
  issuedBy: z.string().uuid().optional(),
});
