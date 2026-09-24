import { z } from "zod";

export const maintenanceRequestCreateSchema = z.object({
  propertyId: z.string().uuid(),
  unitId: z.string().uuid().optional(),
  tenantId: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(4000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  createdBy: z.string().uuid().optional(),
});
export const maintenanceRequestUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(4000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  tenantId: z.string().uuid().optional(),
});
export const maintenanceAssignSchema = z.object({
  vendorId: z.string().uuid(),
});

export const maintenanceCostCreateSchema = z.object({
  vendorId: z.string().uuid().optional(),
  description: z.string().min(1),
  amount: z.number().positive(),
  createExpense: z.boolean().default(false),
  expenseCategoryId: z.string().uuid().optional(),
  paymentMethod: z
    .enum(["CASH", "BANK", "MPESA", "CARD", "CHEQUE", "OTHER"])
    .optional(),
  referenceNumber: z.string().max(150).optional(),
});
