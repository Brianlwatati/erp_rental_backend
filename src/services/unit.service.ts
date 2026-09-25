import * as repo from "../repositories/unit.repository";
import { query } from "../config/database";
async function verify(c: string, id: string) {
  if (
    !(
      await query(
        `SELECT b.id FROM rental_buildings b JOIN rental_properties p ON p.id=b.property_id WHERE b.id=$1 AND p.company_id=$2`,
        [id, c],
      )
    ).rowCount
  )
    throw new Error("BUILDING_NOT_FOUND");
}
export async function listUnits(c: string, b: string) {
  await verify(c, b);
  return repo.findUnits(c, b);
}
export async function createUnit(c: string, b: string, d: any) {
  await verify(c, b);
  return repo.createUnit(b, d);
}
export async function getUnit(c: string, id: string) {
  const x = await repo.findUnitById(c, id);
  if (!x) throw new Error("UNIT_NOT_FOUND");
  return x;
}
export async function updateUnit(c: string, id: string, d: any) {
  const x = await repo.updateUnit(c, id, d);
  if (!x) throw new Error("UNIT_NOT_FOUND");
  return x;
}
export async function deleteUnit(c: string, id: string) {
  const x = await repo.deleteUnit(c, id);
  if (!x) throw new Error("UNIT_NOT_FOUND");
  return x;
}
