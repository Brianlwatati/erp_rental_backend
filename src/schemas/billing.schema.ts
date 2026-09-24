import { z } from "zod";

export const invoiceItemInputSchema = z.object({
  description: z.string().min(1).max(255),
  itemType: z.string().min(1).max(50),
  quantity: z.number().positive().default(1),
  unitPrice: z.number().nonnegative(),
});

export const invoiceCreateSchema = z.object({
  tenantId: z.string().uuid(),
  leaseId: z.string().uuid(),
  invoiceNumber: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().min(1).max(100).optional(),
  ),
  invoiceDate: z.string().date().optional(),
  dueDate: z.string().date(),
  periodStart: z.string().date(),
  periodEnd: z.string().date(),
  discount: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  notes: z.string().max(2000).optional(),
  items: z.array(invoiceItemInputSchema).min(1),
});
export const invoiceUpdateSchema = z.object({
  dueDate: z.string().date().optional(),
  periodStart: z.string().date().optional(),
  periodEnd: z.string().date().optional(),
  discount: z.number().nonnegative().optional(),
  tax: z.number().nonnegative().optional(),
  notes: z.string().max(2000).optional(),
});
export const invoiceCancelSchema = z.object({
  reason: z.string().max(2000).optional(),
});
