import { z } from "zod";

export const expenseCategoryCreateSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(50),
  description: z.string().max(2000).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});
export const expenseCategoryUpdateSchema =
  expenseCategoryCreateSchema.partial();

export const vendorCreateSchema = z.object({
  name: z.string().min(1).max(200),
  contactPerson: z.string().max(200).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  address: z.string().max(2000).optional(),
  serviceType: z.string().max(100).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});
export const vendorUpdateSchema = vendorCreateSchema.partial();

export const expenseCreateSchema = z.object({
  propertyId: z.uuid().optional(),
  buildingId: z.uuid().optional(),
  unitId: z.string().uuid().optional(),
  expenseCategoryId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  expenseNumber: z.string().min(1).max(100).optional(),
  description: z.string().min(1),
  amount: z.number().positive(),
  expenseDate: z.string().date().optional(),
  paymentMethod: z
    .enum(["CASH", "BANK", "MPESA", "CARD", "CHEQUE", "OTHER"])
    .optional(),
  referenceNumber: z.string().max(150).optional(),
  status: z.enum(["DRAFT", "POSTED", "CANCELLED"]).optional(),
});
export const expenseUpdateSchema = expenseCreateSchema.partial();
