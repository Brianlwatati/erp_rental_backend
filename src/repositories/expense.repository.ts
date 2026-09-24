import { query } from "../config/database";

// Expense categories
export async function findExpenseCategories(companyId: string) {
  return (
    await query(
      "SELECT * FROM rental_expense_categories WHERE company_id IN ('default', $1) ORDER BY name",
      [companyId],
    )
  ).rows;
}
export async function findExpenseCategoryById(companyId: string, id: string) {
  return (
    (
      await query(
        "SELECT * FROM rental_expense_categories WHERE company_id=$1 AND id=$2",
        [companyId, id],
      )
    ).rows[0] ?? null
  );
}
export async function createExpenseCategory(companyId: string, d: any) {
  return (
    await query(
      `INSERT INTO rental_expense_categories(company_id,name,code,description,status) VALUES($1,$2,$3,$4,COALESCE($5,'ACTIVE')) RETURNING *`,
      [companyId, d.name, d.code, d.description ?? null, d.status ?? null],
    )
  ).rows[0];
}
export async function updateExpenseCategory(
  companyId: string,
  id: string,
  d: any,
) {
  return (
    (
      await query(
        `UPDATE rental_expense_categories SET name=COALESCE($3,name),code=COALESCE($4,code),description=COALESCE($5,description),status=COALESCE($6,status)
     WHERE company_id=$1 AND id=$2 RETURNING *`,
        [companyId, id, d.name, d.code, d.description, d.status],
      )
    ).rows[0] ?? null
  );
}
export async function deleteExpenseCategory(companyId: string, id: string) {
  return (
    (
      await query(
        "DELETE FROM rental_expense_categories WHERE company_id=$1 AND id=$2 RETURNING id",
        [companyId, id],
      )
    ).rows[0] ?? null
  );
}

// Vendors
export async function findVendors(companyId: string) {
  return (
    await query(
      "SELECT * FROM rental_vendors WHERE company_id=$1 ORDER BY name",
      [companyId],
    )
  ).rows;
}
export async function findVendorById(companyId: string, id: string) {
  return (
    (
      await query(
        "SELECT * FROM rental_vendors WHERE company_id=$1 AND id=$2",
        [companyId, id],
      )
    ).rows[0] ?? null
  );
}
export async function createVendor(companyId: string, d: any) {
  return (
    await query(
      `INSERT INTO rental_vendors(company_id,name,contact_person,phone,email,address,service_type,status)
     VALUES($1,$2,$3,$4,$5,$6,$7,COALESCE($8,'ACTIVE')) RETURNING *`,
      [
        companyId,
        d.name,
        d.contactPerson ?? null,
        d.phone ?? null,
        d.email ?? null,
        d.address ?? null,
        d.serviceType ?? null,
        d.status ?? null,
      ],
    )
  ).rows[0];
}
export async function updateVendor(companyId: string, id: string, d: any) {
  return (
    (
      await query(
        `UPDATE rental_vendors SET name=COALESCE($3,name),contact_person=COALESCE($4,contact_person),phone=COALESCE($5,phone),
      email=COALESCE($6,email),address=COALESCE($7,address),service_type=COALESCE($8,service_type),status=COALESCE($9,status)
     WHERE company_id=$1 AND id=$2 RETURNING *`,
        [
          companyId,
          id,
          d.name,
          d.contactPerson,
          d.phone,
          d.email,
          d.address,
          d.serviceType,
          d.status,
        ],
      )
    ).rows[0] ?? null
  );
}
export async function deleteVendor(companyId: string, id: string) {
  return (
    (
      await query(
        "DELETE FROM rental_vendors WHERE company_id=$1 AND id=$2 RETURNING id",
        [companyId, id],
      )
    ).rows[0] ?? null
  );
}

// Expenses
export async function findExpenses(
  companyId: string,
  filters: { status?: string; propertyId?: string; categoryId?: string },
) {
  const clauses = ["company_id=$1"];
  const params: unknown[] = [companyId];
  if (filters.status) {
    params.push(filters.status);
    clauses.push(`status=$${params.length}`);
  }
  if (filters.propertyId) {
    params.push(filters.propertyId);
    clauses.push(`property_id=$${params.length}`);
  }
  if (filters.categoryId) {
    params.push(filters.categoryId);
    clauses.push(`expense_category_id=$${params.length}`);
  }
  return (
    await query(
      `SELECT * FROM rental_expenses WHERE ${clauses.join(" AND ")} ORDER BY expense_date DESC`,
      params,
    )
  ).rows;
}
export async function findExpenseById(companyId: string, id: string) {
  return (
    (
      await query(
        "SELECT * FROM rental_expenses WHERE company_id=$1 AND id=$2",
        [companyId, id],
      )
    ).rows[0] ?? null
  );
}
export async function createExpense(companyId: string, d: any) {
  return (
    await query(
      `INSERT INTO rental_expenses(company_id,property_id,building_id,unit_id,expense_category_id,vendor_id,expense_number,description,amount,expense_date,payment_method,reference_number,status,created_by)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10,CURRENT_DATE),$11,$12,COALESCE($13,'POSTED'),$14) RETURNING *`,
      [
        companyId,
        d.propertyId ?? null,
        d.buildingId ?? null,
        d.unitId ?? null,
        d.expenseCategoryId ?? null,
        d.vendorId ?? null,
        d.expenseNumber,
        d.description,
        d.amount,
        d.expenseDate ?? null,
        d.paymentMethod ?? null,
        d.referenceNumber ?? null,
        d.status ?? null,
        d.createdBy ?? null,
      ],
    )
  ).rows[0];
}
export async function updateExpense(companyId: string, id: string, d: any) {
  return (
    (
      await query(
        `UPDATE rental_expenses SET property_id=COALESCE($3,property_id),building_id=COALESCE($4,building_id),
      unit_id=COALESCE($5,unit_id),expense_category_id=COALESCE($6,expense_category_id),vendor_id=COALESCE($7,vendor_id),
      description=COALESCE($8,description),amount=COALESCE($9,amount),expense_date=COALESCE($10,expense_date),
      payment_method=COALESCE($11,payment_method),reference_number=COALESCE($12,reference_number),status=COALESCE($13,status),updated_at=NOW()
     WHERE company_id=$1 AND id=$2 RETURNING *`,
        [
          companyId,
          id,
          d.propertyId,
          d.buildingId,
          d.unitId,
          d.expenseCategoryId,
          d.vendorId,
          d.description,
          d.amount,
          d.expenseDate,
          d.paymentMethod,
          d.referenceNumber,
          d.status,
        ],
      )
    ).rows[0] ?? null
  );
}
export async function deleteExpense(companyId: string, id: string) {
  return (
    (
      await query(
        "DELETE FROM rental_expenses WHERE company_id=$1 AND id=$2 RETURNING id",
        [companyId, id],
      )
    ).rows[0] ?? null
  );
}
