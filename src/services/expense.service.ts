import * as repo from "../repositories/expense.repository";
import { query } from "../config/database";
import { generateDocumentNumber } from "../utils/number-generator";

export const listExpenseCategories = (c: string) =>
  repo.findExpenseCategories(c);
export async function getExpenseCategory(c: string, id: string) {
  const x = await repo.findExpenseCategoryById(c, id);
  if (!x) throw new Error("EXPENSE_CATEGORY_NOT_FOUND");
  return x;
}
export const createExpenseCategory = (c: string, d: any) =>
  repo.createExpenseCategory(c, d);
export async function updateExpenseCategory(c: string, id: string, d: any) {
  const x = await repo.updateExpenseCategory(c, id, d);
  if (!x) throw new Error("EXPENSE_CATEGORY_NOT_FOUND");
  return x;
}
export async function deleteExpenseCategory(c: string, id: string) {
  const x = await repo.deleteExpenseCategory(c, id);
  if (!x) throw new Error("EXPENSE_CATEGORY_NOT_FOUND");
  return x;
}

export const listVendors = (c: string) => repo.findVendors(c);
export async function getVendor(c: string, id: string) {
  const x = await repo.findVendorById(c, id);
  if (!x) throw new Error("VENDOR_NOT_FOUND");
  return x;
}
export const createVendor = (c: string, d: any) => repo.createVendor(c, d);
export async function updateVendor(c: string, id: string, d: any) {
  const x = await repo.updateVendor(c, id, d);
  if (!x) throw new Error("VENDOR_NOT_FOUND");
  return x;
}
export async function deleteVendor(c: string, id: string) {
  const x = await repo.deleteVendor(c, id);
  if (!x) throw new Error("VENDOR_NOT_FOUND");
  return x;
}

async function verifyReferences(c: string, d: any) {
  if (d.propertyId) {
    const r = await query(
      "SELECT id FROM rental_properties WHERE id=$1 AND company_id=$2",
      [d.propertyId, c],
    );
    if (!r.rowCount) throw new Error("PROPERTY_NOT_FOUND");
  }
  if (d.buildingId) {
    const r = await query(
      `SELECT b.id FROM rental_buildings b
       JOIN rental_properties p ON p.id=b.property_id
       WHERE b.id=$1 AND p.company_id=$2`,
      [d.buildingId, c],
    );
    if (!r.rowCount) throw new Error("BUILDING_NOT_FOUND");
  }
  if (d.unitId) {
    const r = await query(
      `SELECT u.id FROM rental_units u
       JOIN rental_buildings b ON b.id=u.building_id
       JOIN rental_properties p ON p.id=b.property_id
       WHERE u.id=$1 AND p.company_id=$2`,
      [d.unitId, c],
    );
    if (!r.rowCount) throw new Error("UNIT_NOT_FOUND");
  }
  if (d.propertyId && d.buildingId) {
    const r = await query(
      `SELECT b.id FROM rental_buildings b
       WHERE b.id=$1 AND b.property_id=$2`,
      [d.buildingId, d.propertyId],
    );
    if (!r.rowCount) throw new Error("BUILDING_NOT_FOUND");
  }
  if (d.buildingId && d.unitId) {
    const r = await query(
      "SELECT id FROM rental_units WHERE id=$1 AND building_id=$2",
      [d.unitId, d.buildingId],
    );
    if (!r.rowCount) throw new Error("UNIT_NOT_FOUND");
  }
  if (d.expenseCategoryId) {
    const r = await query(
      "SELECT id FROM rental_expense_categories WHERE id=$1 AND (company_id=$2 OR company_id='default')",
      // company_id IN ($2, 'default')
      [d.expenseCategoryId, c],
    );
    if (!r.rowCount) throw new Error("EXPENSE_CATEGORY_NOT_FOUND");
  }
  if (d.vendorId) {
    const r = await query(
      "SELECT id FROM rental_vendors WHERE id=$1 AND company_id=$2",
      [d.vendorId, c],
    );
    if (!r.rowCount) throw new Error("VENDOR_NOT_FOUND");
  }
}

export const listExpenses = (
  c: string,
  filters: { status?: string; propertyId?: string; categoryId?: string },
) => repo.findExpenses(c, filters);
export async function getExpense(c: string, id: string) {
  const x = await repo.findExpenseById(c, id);
  if (!x) throw new Error("EXPENSE_NOT_FOUND");
  return x;
}
export async function createExpense(c: string, d: any) {
  await verifyReferences(c, d);
  return repo.createExpense(c, {
    ...d,
    expenseNumber: d.expenseNumber ?? generateDocumentNumber("EXP"),
  });
}
export async function updateExpense(c: string, id: string, d: any) {
  await verifyReferences(c, d);
  const x = await repo.updateExpense(c, id, d);
  if (!x) throw new Error("EXPENSE_NOT_FOUND");
  return x;
}
export async function deleteExpense(c: string, id: string) {
  const x = await repo.deleteExpense(c, id);
  if (!x) throw new Error("EXPENSE_NOT_FOUND");
  return x;
}
