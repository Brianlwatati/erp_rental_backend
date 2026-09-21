import { z } from 'zod';

export const leaseCreateSchema = z.object({
  unitId: z.string().uuid(), tenantId: z.string().uuid(),
  leaseNumber: z.string().min(1).max(100).optional(),
  startDate: z.string().date(), endDate: z.string().date().optional(),
  monthlyRent: z.number().nonnegative(), depositAmount: z.number().nonnegative().default(0),
  billingDay: z.number().int().min(1).max(28).default(1),
  status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED']).optional(),
  notes: z.string().max(2000).optional()
});
export const leaseUpdateSchema = leaseCreateSchema.omit({ unitId: true, tenantId: true }).partial();

export const leaseTerminateSchema = z.object({
  terminationDate: z.string().date(), terminationReason: z.string().max(2000).optional()
});

export const leaseChargeCreateSchema = z.object({
  name: z.string().min(1).max(150), chargeType: z.string().min(1).max(50),
  amount: z.number().nonnegative(), recurring: z.boolean().default(true)
});
