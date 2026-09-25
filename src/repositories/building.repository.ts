import { query, withTransaction } from "../config/database";

export async function findallBuildings(companyId: string) {
  return (
    await query(
      `SELECT b.* FROM rental_buildings b JOIN rental_properties p ON p.id=b.property_id WHERE p.company_id=$1 ORDER BY b.created_at DESC`,
      [companyId],
    )
  ).rows;
}

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
      `INSERT INTO rental_buildings(property_id,property_name,property_code,name,code,floors,description) SELECT $1,p.name,p.code,$2,$3,$4,$5 FROM rental_properties p WHERE p.id=$1 RETURNING *`,
      [propertyId, d.name, d.code, d.floors ?? null, d.description ?? null],
    )
  ).rows[0];
}
export async function updateBuilding(companyId: string, id: string, d: any) {
  return withTransaction(async (client) => {
    const result = await client.query(
      `UPDATE rental_buildings b SET name=COALESCE($3,b.name),code=COALESCE($4,b.code),floors=COALESCE($5,b.floors),description=COALESCE($6,b.description),updated_at=NOW() FROM rental_properties p WHERE b.id=$2 AND b.property_id=p.id AND p.company_id=$1 RETURNING b.*`,
      [companyId, id, d.name, d.code, d.floors, d.description],
    );
    if (!result.rows[0]) return null;

    await client.query(
      `UPDATE rental_units SET building_name=$2,building_code=$3,updated_at=NOW() WHERE building_id=$1`,
      [id, result.rows[0].name, result.rows[0].code],
    );
    return result.rows[0];
  });
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
