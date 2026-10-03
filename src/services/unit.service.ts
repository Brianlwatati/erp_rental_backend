import * as repo from "../repositories/unit.repository";
import { withTransaction } from "../config/database";
export async function listUnits(c: string, b: string) {
  if (!(await repo.buildingExists(c, b))) throw new Error("BUILDING_NOT_FOUND");
  return repo.findUnits(c, b);
}
export async function listUnitsByProperty(c: string, propertyId: string) {
  if (!(await repo.propertyExists(c, propertyId)))
    throw new Error("PROPERTY_NOT_FOUND");
  return repo.findUnitsByProperty(c, propertyId);
}
export async function createUnit(c: string, b: string, d: any) {
  return withTransaction(async (client) => {
    const building = await repo.lockBuildingForUnitCreation(c, b, client);
    if (!building.rowCount) throw new Error("BUILDING_NOT_FOUND");
    return repo.createUnit(b, d, client);
  });
}
export async function getUnit(c: string, id: string) {
  const x = await repo.findUnitById(c, id);
  if (!x) throw new Error("UNIT_NOT_FOUND");
  return x;
}
export async function updateUnit(c: string, id: string, d: any) {
  return withTransaction(async (client) => {
    const existing = await repo.findUnitByIdForUpdate(c, id, client);
    if (!existing) throw new Error("UNIT_NOT_FOUND");

    const updates = { ...d };
    if (
      d.floor !== undefined &&
      d.floor !== existing.floor &&
      d.gridColumn === undefined
    ) {
        updates.gridColumn = await repo.nextGridColumn(
          existing.building_id,
          d.floor,
          client,
        );
    }

    const updated = await repo.updateUnit(c, id, updates, client);
    if (!updated) throw new Error("UNIT_NOT_FOUND");
    return updated;
  });
}
export async function deleteUnit(c: string, id: string) {
  const x = await repo.deleteUnit(c, id);
  if (!x) throw new Error("UNIT_NOT_FOUND");
  return x;
}
