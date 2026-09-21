import { z } from 'zod';

export const tenantCreateSchema = z.object({
  firstName: z.string().min(1).max(100), lastName: z.string().min(1).max(100),
  email: z.string().email().max(255).optional(), phone: z.string().max(50).optional(),
  nationalId: z.string().max(100).optional(), address: z.string().max(2000).optional(),
  emergencyContactName: z.string().max(200).optional(),
  emergencyContactPhone: z.string().max(50).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLACKLISTED']).optional()
});
export const tenantUpdateSchema = tenantCreateSchema.partial();

export const tenantDocumentCreateSchema = z.object({
  documentType: z.string().min(1).max(100), documentName: z.string().min(1).max(255),
  documentUrl: z.string().max(2000).optional(), expiresAt: z.string().date().optional()
});
