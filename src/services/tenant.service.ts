import * as repo from '../repositories/tenant.repository';

export const listTenants = (c: string, status?: string) => repo.findTenants(c, status);

export async function getTenant(c: string, id: string) {
  const x = await repo.findTenantById(c, id);
  if (!x) throw new Error('TENANT_NOT_FOUND');
  return x;
}
export const createTenant = (c: string, d: any) => repo.createTenant(c, d);

export async function updateTenant(c: string, id: string, d: any) {
  const x = await repo.updateTenant(c, id, d);
  if (!x) throw new Error('TENANT_NOT_FOUND');
  return x;
}
export async function deleteTenant(c: string, id: string) {
  const x = await repo.deleteTenant(c, id);
  if (!x) throw new Error('TENANT_NOT_FOUND');
  return x;
}

export async function listTenantDocuments(c: string, tenantId: string) {
  await getTenant(c, tenantId);
  return repo.findTenantDocuments(c, tenantId);
}
export async function addTenantDocument(c: string, tenantId: string, d: any) {
  await getTenant(c, tenantId);
  return repo.createTenantDocument(tenantId, d);
}
export async function deleteTenantDocument(c: string, id: string) {
  const x = await repo.deleteTenantDocument(c, id);
  if (!x) throw new Error('TENANT_DOCUMENT_NOT_FOUND');
  return x;
}
