import * as repo from "../repositories/property.repository";
export const listProperties = (c: string) => repo.findProperties(c);
export async function getProperty(c: string, id: string) {
  const x = await repo.findPropertyById(c, id);
  if (!x) throw new Error("PROPERTY_NOT_FOUND");
  return x;
}
export const createProperty = (c: string, d: any) => repo.createProperty(c, d);
export async function updateProperty(c: string, id: string, d: any) {
  const x = await repo.updateProperty(c, id, d);
  if (!x) throw new Error("PROPERTY_NOT_FOUND");
  return x;
}
export async function deleteProperty(c: string, id: string) {
  const x = await repo.deleteProperty(c, id);
  if (!x) throw new Error("PROPERTY_NOT_FOUND");
  return x;
}
