import { query } from "../config/database";
import type { PoolClient } from "pg";

type Executor = Pick<PoolClient, "query">;

export async function buildingExists(companyId: string, buildingId: string) {
  return (
    await query(
      `SELECT b.id
       FROM rental_buildings b
       JOIN rental_properties p ON p.id=b.property_id
       WHERE b.id=$1 AND p.company_id=$2`,
      [buildingId, companyId],
    )
  ).rowCount;
}

export async function propertyExists(companyId: string, propertyId: string) {
  return (
    await query(
      `SELECT id FROM rental_properties WHERE id=$1 AND company_id=$2`,
      [propertyId, companyId],
    )
  ).rowCount;
}

export async function lockBuildingForUnitCreation(
  companyId: string,
  buildingId: string,
  e: Executor,
) {
  return e.query(
    `SELECT b.id FROM rental_buildings b
     JOIN rental_properties p ON p.id=b.property_id
     WHERE b.id=$1 AND p.company_id=$2
     FOR UPDATE OF b`,
    [buildingId, companyId],
  );
}

export async function findUnitByIdForUpdate(
  companyId: string,
  id: string,
  e: Executor,
) {
  return (
    (
      await e.query(
        `SELECT u.*, p.id AS property_id, p.name AS property_name, p.code AS property_code
         FROM rental_units u
         JOIN rental_buildings b ON b.id=u.building_id
         JOIN rental_properties p ON p.id=b.property_id
         WHERE p.company_id=$1 AND u.id=$2
         FOR UPDATE OF u, b`,
        [companyId, id],
      )
    ).rows[0] ?? null
  );
}

export async function nextGridColumn(
  buildingId: string,
  floor: number,
  e: Executor,
) {
  const result = await e.query(
    `SELECT COALESCE(MAX(grid_column) + 1, 0) AS grid_column
     FROM rental_units WHERE building_id=$1 AND floor=$2`,
    [buildingId, floor],
  );
  return Number(result.rows[0].grid_column);
}

export async function findUnits(companyId: string, buildingId: string) {
  return (
    await query(
      `SELECT u.*, p.id AS property_id, p.name AS property_name, p.code AS property_code
       FROM rental_units u
       JOIN rental_buildings b ON b.id=u.building_id
       JOIN rental_properties p ON p.id=b.property_id
       WHERE p.company_id=$1 AND u.building_id=$2
       ORDER BY u.floor, u.grid_column, u.unit_number`,
      [companyId, buildingId],
    )
  ).rows;
}
export async function findUnitsByProperty(
  companyId: string,
  propertyId: string,
) {
  return (
    await query(
      `SELECT u.*, p.id AS property_id, p.name AS property_name, p.code AS property_code
       FROM rental_units u
       JOIN rental_buildings b ON b.id=u.building_id
       JOIN rental_properties p ON p.id=b.property_id
       WHERE p.company_id=$1 AND p.id=$2
       ORDER BY b.name, u.floor, u.grid_column, u.unit_number`,
      [companyId, propertyId],
    )
  ).rows;
}
export async function findUnitById(companyId: string, id: string) {
  return (
    (
      await query(
        `SELECT u.*, b.floors AS building_floors,
                ut.name AS unit_type_name, ut.code AS unit_type_code,
                ut.bedrooms AS unit_type_bedrooms,
                ut.bathrooms AS unit_type_bathrooms
         FROM rental_units u
         JOIN rental_buildings b ON b.id=u.building_id
         LEFT JOIN rental_unit_types ut ON ut.id=u.unit_type_id
         WHERE u.company_id=$1 AND u.id=$2`,
        [companyId, id],
      )
    ).rows[0] ?? null
  );
}
export async function createUnit(buildingId: string, d: any, e: Executor) {
  const gridColumn =
    d.gridColumn ??
    (d.floor == null ? null : await nextGridColumn(buildingId, d.floor, e));
  return (
    await e.query(
      `INSERT INTO rental_units(property_id,property_name,property_code,company_id,building_id,building_name,building_code,unit_type_id,unit_number,floor,grid_column,monthly_rent,deposit_amount,status,description)
       SELECT p.id,p.name,p.code,p.company_id,b.id,b.name,b.code,$2,$3,$4,$5,$6,$7,$8,$9
       FROM rental_buildings b
       JOIN rental_properties p ON p.id=b.property_id
       WHERE b.id=$1
       RETURNING *`,
      [
        buildingId,
        d.unitTypeId ?? null,
        d.unitNumber,
        d.floor ?? null,
        gridColumn,
        d.monthlyRent,
        d.depositAmount ?? 0,
        d.status ?? "VACANT",
        d.description ?? null,
      ],
    )
  ).rows[0];
}
export async function updateUnit(
  companyId: string,
  id: string,
  d: any,
  e: Executor,
) {
  return (
    (
      await e.query(
        `UPDATE rental_units u SET unit_type_id=COALESCE($3,u.unit_type_id),unit_number=COALESCE($4,u.unit_number),floor=COALESCE($5,u.floor),grid_column=COALESCE($6,u.grid_column),monthly_rent=COALESCE($7,u.monthly_rent),deposit_amount=COALESCE($8,u.deposit_amount),status=COALESCE($9,u.status),description=COALESCE($10,u.description),updated_at=NOW() FROM rental_buildings b JOIN rental_properties p ON p.id=b.property_id WHERE u.id=$2 AND u.building_id=b.id AND p.company_id=$1 RETURNING u.*, p.id AS property_id, p.name AS property_name, p.code AS property_code`,
        [
          companyId,
          id,
          d.unitTypeId,
          d.unitNumber,
          d.floor,
          d.gridColumn,
          d.monthlyRent,
          d.depositAmount,
          d.status,
          d.description,
        ],
      )
    ).rows[0] ?? null
  );
}
export async function deleteUnit(companyId: string, id: string) {
  return (
    (
      await query(
        `DELETE FROM rental_units u USING rental_buildings b,rental_properties p WHERE u.id=$2 AND u.building_id=b.id AND b.property_id=p.id AND p.company_id=$1 RETURNING u.id`,
        [companyId, id],
      )
    ).rows[0] ?? null
  );
}
