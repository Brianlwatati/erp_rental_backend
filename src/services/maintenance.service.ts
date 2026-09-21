import * as repo from '../repositories/maintenance.repository';
import * as expenseRepo from '../repositories/expense.repository';
import { query, withTransaction } from '../config/database';
import { generateDocumentNumber } from '../utils/number-generator';

async function verifyProperty(c: string, propertyId: string) {
  const r = await query('SELECT id FROM rental_properties WHERE id=$1 AND company_id=$2', [propertyId, c]);
  if (!r.rowCount) throw new Error('PROPERTY_NOT_FOUND');
}
async function verifyVendor(c: string, vendorId: string) {
  const r = await query('SELECT id FROM rental_vendors WHERE id=$1 AND company_id=$2', [vendorId, c]);
  if (!r.rowCount) throw new Error('VENDOR_NOT_FOUND');
}

export const listRequests = (c: string, filters: { status?: string; unitId?: string; propertyId?: string }) => repo.findRequests(c, filters);

export async function getRequest(c: string, id: string) {
  const x = await repo.findRequestById(c, id);
  if (!x) throw new Error('MAINTENANCE_REQUEST_NOT_FOUND');
  return x;
}
export async function createRequest(c: string, d: any) {
  await verifyProperty(c, d.propertyId);
  return repo.createRequest(c, d);
}
export async function updateRequest(c: string, id: string, d: any) {
  const x = await repo.updateRequest(c, id, d);
  if (!x) throw new Error('MAINTENANCE_REQUEST_NOT_FOUND');
  return x;
}
export async function assignRequest(c: string, id: string, vendorId: string) {
  await verifyVendor(c, vendorId);
  const existing = await getRequest(c, id);
  if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') throw new Error('MAINTENANCE_REQUEST_CLOSED');
  const x = await repo.setRequestStatus(c, id, 'ASSIGNED', { vendorId });
  if (!x) throw new Error('MAINTENANCE_REQUEST_NOT_FOUND');
  return x;
}
export async function startRequest(c: string, id: string) {
  const existing = await getRequest(c, id);
  if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') throw new Error('MAINTENANCE_REQUEST_CLOSED');
  const x = await repo.setRequestStatus(c, id, 'IN_PROGRESS');
  if (!x) throw new Error('MAINTENANCE_REQUEST_NOT_FOUND');
  return x;
}
export async function completeRequest(c: string, id: string) {
  const existing = await getRequest(c, id);
  if (existing.status === 'CANCELLED') throw new Error('MAINTENANCE_REQUEST_CLOSED');
  const x = await repo.setRequestStatus(c, id, 'COMPLETED', { resolvedAt: true });
  if (!x) throw new Error('MAINTENANCE_REQUEST_NOT_FOUND');
  return x;
}
export async function cancelRequest(c: string, id: string) {
  const existing = await getRequest(c, id);
  if (existing.status === 'COMPLETED') throw new Error('MAINTENANCE_REQUEST_CLOSED');
  const x = await repo.setRequestStatus(c, id, 'CANCELLED');
  if (!x) throw new Error('MAINTENANCE_REQUEST_NOT_FOUND');
  return x;
}
export async function deleteRequest(c: string, id: string) {
  const x = await repo.deleteRequest(c, id);
  if (!x) throw new Error('MAINTENANCE_REQUEST_NOT_FOUND');
  return x;
}

export async function listCosts(c: string, requestId: string) {
  await getRequest(c, requestId);
  return repo.findCosts(c, requestId);
}

export async function addCost(c: string, requestId: string, d: any) {
  const request = await getRequest(c, requestId);
  if (d.vendorId) await verifyVendor(c, d.vendorId);

  return withTransaction(async (client) => {
    let expenseId: string | null = null;
    if (d.createExpense) {
      const expense = await expenseRepo.createExpense(c, {
        propertyId: request.property_id,
        unitId: request.unit_id,
        expenseCategoryId: d.expenseCategoryId ?? null,
        vendorId: d.vendorId ?? null,
        expenseNumber: generateDocumentNumber('EXP'),
        description: d.description,
        amount: d.amount,
        paymentMethod: d.paymentMethod ?? null,
        referenceNumber: d.referenceNumber ?? null,
        status: 'POSTED'
      });
      expenseId = expense.id;
    }
    return repo.createCost(requestId, d, expenseId, client);
  });
}

export async function deleteCost(c: string, id: string) {
  const x = await repo.deleteCost(c, id);
  if (!x) throw new Error('MAINTENANCE_COST_NOT_FOUND');
  return x;
}
