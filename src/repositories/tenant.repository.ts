import { query } from '../config/database';

export async function findTenants(companyId: string, status?: string) {
  if (status) return (await query('SELECT * FROM rental_tenants WHERE company_id=$1 AND status=$2 ORDER BY created_at DESC', [companyId, status])).rows;
  return (await query('SELECT * FROM rental_tenants WHERE company_id=$1 ORDER BY created_at DESC', [companyId])).rows;
}
export async function findTenantById(companyId: string, id: string) {
  return (await query('SELECT * FROM rental_tenants WHERE company_id=$1 AND id=$2', [companyId, id])).rows[0] ?? null;
}
export async function createTenant(companyId: string, d: any) {
  return (await query(
    `INSERT INTO rental_tenants(company_id,first_name,last_name,email,phone,national_id,address,emergency_contact_name,emergency_contact_phone,status)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10,'ACTIVE')) RETURNING *`,
    [companyId, d.firstName, d.lastName, d.email ?? null, d.phone ?? null, d.nationalId ?? null, d.address ?? null, d.emergencyContactName ?? null, d.emergencyContactPhone ?? null, d.status ?? null]
  )).rows[0];
}
export async function updateTenant(companyId: string, id: string, d: any) {
  return (await query(
    `UPDATE rental_tenants SET first_name=COALESCE($3,first_name),last_name=COALESCE($4,last_name),
      email=COALESCE($5,email),phone=COALESCE($6,phone),national_id=COALESCE($7,national_id),
      address=COALESCE($8,address),emergency_contact_name=COALESCE($9,emergency_contact_name),
      emergency_contact_phone=COALESCE($10,emergency_contact_phone),status=COALESCE($11,status),updated_at=NOW()
     WHERE company_id=$1 AND id=$2 RETURNING *`,
    [companyId, id, d.firstName, d.lastName, d.email, d.phone, d.nationalId, d.address, d.emergencyContactName, d.emergencyContactPhone, d.status]
  )).rows[0] ?? null;
}
export async function deleteTenant(companyId: string, id: string) {
  return (await query('DELETE FROM rental_tenants WHERE company_id=$1 AND id=$2 RETURNING id', [companyId, id])).rows[0] ?? null;
}

export async function findTenantDocuments(companyId: string, tenantId: string) {
  return (await query(
    `SELECT td.* FROM rental_tenant_documents td JOIN rental_tenants t ON t.id=td.tenant_id
     WHERE t.company_id=$1 AND td.tenant_id=$2 ORDER BY td.created_at DESC`,
    [companyId, tenantId]
  )).rows;
}
export async function createTenantDocument(tenantId: string, d: any) {
  return (await query(
    `INSERT INTO rental_tenant_documents(tenant_id,document_type,document_name,document_url,expires_at)
     VALUES($1,$2,$3,$4,$5) RETURNING *`,
    [tenantId, d.documentType, d.documentName, d.documentUrl ?? null, d.expiresAt ?? null]
  )).rows[0];
}
export async function findTenantDocumentById(companyId: string, id: string) {
  return (await query(
    `SELECT td.* FROM rental_tenant_documents td JOIN rental_tenants t ON t.id=td.tenant_id
     WHERE t.company_id=$1 AND td.id=$2`,
    [companyId, id]
  )).rows[0] ?? null;
}
export async function deleteTenantDocument(companyId: string, id: string) {
  return (await query(
    `DELETE FROM rental_tenant_documents td USING rental_tenants t
     WHERE td.id=$2 AND td.tenant_id=t.id AND t.company_id=$1 RETURNING td.id`,
    [companyId, id]
  )).rows[0] ?? null;
}
