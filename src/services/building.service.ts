import * as repo from '../repositories/building.repository'; import { query } from '../config/database';
async function verify(c:string,id:string){if(!(await query('SELECT id FROM rental_properties WHERE id=$1 AND company_id=$2',[id,c])).rowCount)throw new Error('PROPERTY_NOT_FOUND');}
export async function listBuildings(c:string,p:string){await verify(c,p);return repo.findBuildings(c,p);}
export async function createBuilding(c:string,p:string,d:any){await verify(c,p);return repo.createBuilding(p,d);}
export async function getBuilding(c:string,id:string){const x=await repo.findBuildingById(c,id);if(!x)throw new Error('BUILDING_NOT_FOUND');return x;}
export async function updateBuilding(c:string,id:string,d:any){const x=await repo.updateBuilding(c,id,d);if(!x)throw new Error('BUILDING_NOT_FOUND');return x;}
export async function deleteBuilding(c:string,id:string){const x=await repo.deleteBuilding(c,id);if(!x)throw new Error('BUILDING_NOT_FOUND');return x;}
