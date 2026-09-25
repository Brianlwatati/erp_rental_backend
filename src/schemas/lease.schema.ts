import { z } from "zod";

export const leaseCreateSchema = z.object({
  unitId: z.string().uuid(),
  unitNumber: z.string().min(1).max(50),
  buildingId: z.string().uuid(),
  buildingName: z.string().min(1).max(150),
  buildingCode: z.string().min(1).max(50),
  propertyName: z.string().min(1).max(150),
  propertyCode: z.string().min(1).max(50),
  tenantId: z.string().uuid(),
  tenantFirstName: z.string().min(1).max(100),
  tenantLastName: z.string().min(1).max(100),
  tenantEmail: z.string().email().max(100).optional(),
  tenantPhone: z.string().max(20).optional(),
  leaseNumber: z.string().min(1).max(100).optional(),
  startDate: z.string().date(),
  endDate: z.string().date().optional(),
  monthlyRent: z.number().nonnegative(),
  depositAmount: z.number().nonnegative().default(0),
  billingDay: z.number().int().min(1).max(28).default(1),
  status: z.enum(["DRAFT", "ACTIVE", "EXPIRED", "TERMINATED"]).optional(),
  notes: z.string().max(2000).optional(),
});
export const leaseUpdateSchema = leaseCreateSchema
  .omit({
    unitId: true,
    unitNumber: true,
    buildingId: true,
    buildingName: true,
    buildingCode: true,
    propertyName: true,
    propertyCode: true,
    tenantId: true,
  })
  .partial();

export const leaseTerminateSchema = z.object({
  terminationDate: z.string().date(),
  terminationReason: z.string().max(2000).optional(),
});

export const leaseChargeCreateSchema = z.object({
  name: z.string().min(1).max(150),
  chargeType: z.string().min(1).max(50),
  amount: z.number().nonnegative(),
  recurring: z.boolean().default(true),
});
