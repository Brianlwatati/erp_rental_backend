import { query } from "../config/database";

export async function findUnitTypes(companyId: string) {
  return (
    await query(
      `SELECT id, company_id, name, code, bedrooms, bathrooms, description,
              (company_id = 'default') AS is_default
       FROM rental_unit_types
       WHERE company_id IN ($1, 'default')
       ORDER BY name`,
      [companyId],
    )
  ).rows;
}

export async function findUnitTypeById(companyId: string, id: string) {
  return (
    (
      await query(
        `SELECT * FROM rental_unit_types WHERE company_id=$1 AND id=$2`,
        [companyId, id],
      )
    ).rows[0] ?? null
  );
}

export async function createUnitType(companyId: string, data: any) {
  return (
    await query(
      `INSERT INTO rental_unit_types(company_id,name,code,bedrooms,bathrooms,description) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        companyId,
        data.name,
        data.code,
        data.bedrooms ?? 0,
        data.bathrooms ?? 0,
        data.description ?? null,
      ],
    )
  ).rows[0];
}

export async function updateUnitType(companyId: string, id: string, data: any) {
  return (
    (
      await query(
        `UPDATE rental_unit_types SET name=COALESCE($3,name),code=COALESCE($4,code),bedrooms=COALESCE($5,bedrooms),bathrooms=COALESCE($6,bathrooms),description=COALESCE($7,description) WHERE company_id=$1 AND id=$2 RETURNING *`,
        [
          companyId,
          id,
          data.name,
          data.code,
          data.bedrooms,
          data.bathrooms,
          data.description,
        ],
      )
    ).rows[0] ?? null
  );
}

export async function deleteUnitType(companyId: string, id: string) {
  return (
    (
      await query(
        `DELETE FROM rental_unit_types WHERE company_id=$1 AND id=$2 RETURNING id`,
        [companyId, id],
      )
    ).rows[0] ?? null
  );
}
