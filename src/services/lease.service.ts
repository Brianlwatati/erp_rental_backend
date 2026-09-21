import * as repo from '../repositories/lease.repository';
import { query } from '../config/database';
import { generateDocumentNumber } from '../utils/number-generator';

async function verifyUnit(c: string, unitId: string) {
  const r = await query(
    `SELECT u.id FROM rental_units u JOIN rental_buildings b ON b.id=u.building_id JOIN rental_properties p ON p.id=b.property_id
     WHERE u.id=$1 AND p.company_id=$2`,
    [unitId, c]
  );
  if (!r.rowCount) throw new Error('UNIT_NOT_FOUND');
}
async function verifyTenant(c: string, tenantId: string) {
  const r = await query('SELECT id FROM rental_tenants WHERE id=$1 AND company_id=$2', [tenantId, c]);
  if (!r.rowCount) throw new Error('TENANT_NOT_FOUND');
}
async function setUnitStatus(unitId: string, status: string) {
  await query('UPDATE rental_units SET status=$2, updated_at=NOW() WHERE id=$1', [unitId, status]);
}

export const listLeases = (c: string, filters: { status?: string; tenantId?: string; unitId?: string }) => repo.findLeases(c, filters);

export async function getLease(c: string, id: string) {
  const x = await repo.findLeaseById(c, id);
  if (!x) throw new Error('LEASE_NOT_FOUND');
  return x;
}
export async function createLease(c: string, d: any) {
  await verifyUnit(c, d.unitId);
  await verifyTenant(c, d.tenantId);
  const lease = await repo.createLease(c, { ...d, leaseNumber: d.leaseNumber ?? generateDocumentNumber('LSE') });
  if (lease.status === 'ACTIVE') await setUnitStatus(d.unitId, 'OCCUPIED');
  return lease;
}
export async function updateLease(c: string, id: string, d: any) {
  const existing = await getLease(c, id);
  const x = await repo.updateLease(c, id, d);
  if (!x) throw new Error('LEASE_NOT_FOUND');
  if (d.status && d.status !== existing.status) {
    if (d.status === 'ACTIVE') await setUnitStatus(x.unit_id, 'OCCUPIED');
    else if (['TERMINATED', 'EXPIRED'].includes(d.status)) await setUnitStatus(x.unit_id, 'VACANT');
  }
  return x;
}
export async function terminateLease(c: string, id: string, d: any) {
  const x = await repo.terminateLease(c, id, d);
  if (!x) throw new Error('LEASE_NOT_FOUND_OR_ALREADY_TERMINATED');
  await setUnitStatus(x.unit_id, 'VACANT');
  return x;
}
export async function deleteLease(c: string, id: string) {
  const x = await repo.deleteLease(c, id);
  if (!x) throw new Error('LEASE_NOT_FOUND');
  return x;
}

export async function listLeaseCharges(c: string, leaseId: string) {
  await getLease(c, leaseId);
  return repo.findLeaseCharges(c, leaseId);
}
export async function addLeaseCharge(c: string, leaseId: string, d: any) {
  await getLease(c, leaseId);
  return repo.createLeaseCharge(leaseId, d);
}
export async function deleteLeaseCharge(c: string, id: string) {
  const x = await repo.deleteLeaseCharge(c, id);
  if (!x) throw new Error('LEASE_CHARGE_NOT_FOUND');
  return x;
}
