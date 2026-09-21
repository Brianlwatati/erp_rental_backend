import { z } from 'zod';

export const propertyCreateSchema = z.object({
  name: z.string().min(2).max(150), code: z.string().min(1).max(50),
  propertyType: z.string().max(50).optional(), address: z.string().max(500).optional(),
  city: z.string().max(100).optional(), county: z.string().max(100).optional(),
  description: z.string().max(2000).optional()
});
export const propertyUpdateSchema = propertyCreateSchema.partial().extend({
  status: z.enum(['ACTIVE','INACTIVE']).optional()
});
export const buildingCreateSchema = z.object({
  name: z.string().min(2).max(150), code: z.string().min(1).max(50),
  floors: z.number().int().min(0).optional(), description: z.string().max(2000).optional()
});
export const buildingUpdateSchema = buildingCreateSchema.partial();
export const unitCreateSchema = z.object({
  unitTypeId: z.string().uuid().optional(), unitNumber: z.string().min(1).max(50),
  floor: z.number().int().optional(), monthlyRent: z.number().nonnegative(),
  depositAmount: z.number().nonnegative().default(0),
  status: z.enum(['VACANT','OCCUPIED','RESERVED','MAINTENANCE','INACTIVE']).default('VACANT'),
  description: z.string().max(2000).optional()
});
export const unitUpdateSchema = unitCreateSchema.partial();
