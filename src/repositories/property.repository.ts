import { query } from "../config/database";
export async function findProperties(companyId: string) {
  return (
    await query(
      "SELECT * FROM rental_properties WHERE company_id=$1 ORDER BY created_at DESC",
      [companyId],
    )
  ).rows;
}
export async function findPropertyById(companyId: string, id: string) {
  return (
    (
      await query(
        "SELECT * FROM rental_properties WHERE company_id=$1 AND id=$2",
        [companyId, id],
      )
    ).rows[0] ?? null
  );
}
export async function createProperty(companyId: string, d: any) {
  return (
    await query(
      `INSERT INTO rental_properties(company_id,name,code,property_type,address,city,county,description) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        companyId,
        d.name,
        d.code,
        d.propertyType ?? null,
        d.address ?? null,
        d.city ?? null,
        d.county ?? null,
        d.description ?? null,
      ],
    )
  ).rows[0];
}
export async function updateProperty(companyId: string, id: string, d: any) {
  return (
    (
      await query(
        `UPDATE rental_properties SET name=COALESCE($3,name),code=COALESCE($4,code),property_type=COALESCE($5,property_type),address=COALESCE($6,address),city=COALESCE($7,city),county=COALESCE($8,county),description=COALESCE($9,description),status=COALESCE($10,status),updated_at=NOW() WHERE company_id=$1 AND id=$2 RETURNING *`,
        [
          companyId,
          id,
          d.name,
          d.code,
          d.propertyType,
          d.address,
          d.city,
          d.county,
          d.description,
          d.status,
        ],
      )
    ).rows[0] ?? null
  );
}
export async function deleteProperty(companyId: string, id: string) {
  return (
    (
      await query(
        "DELETE FROM rental_properties WHERE company_id=$1 AND id=$2 RETURNING id",
        [companyId, id],
      )
    ).rows[0] ?? null
  );
}
