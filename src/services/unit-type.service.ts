import * as repo from "../repositories/unit-type.repository";

export function listUnitTypes(companyId: string) {
  return repo.findUnitTypes(companyId);
}

export async function getUnitType(companyId: string, id: string) {
  const unitType = await repo.findUnitTypeById(companyId, id);
  if (!unitType) throw new Error("UNIT_TYPE_NOT_FOUND");
  return unitType;
}

export function createUnitType(companyId: string, data: any) {
  return repo.createUnitType(companyId, data);
}

export async function updateUnitType(companyId: string, id: string, data: any) {
  const unitType = await repo.updateUnitType(companyId, id, data);
  if (!unitType) throw new Error("UNIT_TYPE_NOT_FOUND");
  return unitType;
}

export async function deleteUnitType(companyId: string, id: string) {
  const unitType = await repo.deleteUnitType(companyId, id);
  if (!unitType) throw new Error("UNIT_TYPE_NOT_FOUND");
  return unitType;
}
