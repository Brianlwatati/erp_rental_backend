import { query } from "../config/database";
export async function findBuildings(companyId: string, propertyId: string) {
  return (
    await query(
      `SELECT b.* FROM rental_buildings b JOIN rental_properties p ON p.id=b.property_id WHERE p.company_id=$1 AND b.property_id=$2 ORDER BY b.created_at DESC`,
      [companyId, propertyId],
    )
  ).rows;
}
export async function findBuildingById(companyId: string, id: string) {
  return (
    (
      await query(
        `SELECT b.* FROM rental_buildings b JOIN rental_properties p ON p.id=b.property_id WHERE p.company_id=$1 AND b.id=$2`,
        [companyId, id],
      )
    ).rows[0] ?? null
  );
}
export async function createBuilding(propertyId: string, d: any) {
  return (
    await query(
      `INSERT INTO rental_buildings(property_id,name,code,floors,description) VALUES($1,$2,$3,$4,$5) RETURNING *`,
      [propertyId, d.name, d.code, d.floors ?? null, d.description ?? null],
    )
  ).rows[0];
}
export async function updateBuilding(companyId: string, id: string, d: any) {
  return (
    (
      await query(
        `UPDATE rental_buildings b SET name=COALESCE($3,b.name),code=COALESCE($4,b.code),floors=COALESCE($5,b.floors),description=COALESCE($6,b.description),updated_at=NOW() FROM rental_properties p WHERE b.id=$2 AND b.property_id=p.id AND p.company_id=$1 RETURNING b.*`,
        [companyId, id, d.name, d.code, d.floors, d.description],
      )
    ).rows[0] ?? null
  );
}
export async function deleteBuilding(companyId: string, id: string) {
  return (
    (
      await query(
        `DELETE FROM rental_buildings b USING rental_properties p WHERE b.id=$2 AND b.property_id=p.id AND p.company_id=$1 RETURNING b.id`,
        [companyId, id],
      )
    ).rows[0] ?? null
  );
}
