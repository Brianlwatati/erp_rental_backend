import { query } from "../config/database";

export async function findCompanyOverview(companyId: string) {
  const result = await query(
    `SELECT
       (SELECT COUNT(*) FROM rental_properties WHERE company_id=$1) AS "totalProperties",
       (SELECT COUNT(*)
          FROM rental_buildings b
          JOIN rental_properties p ON p.id=b.property_id
         WHERE p.company_id=$1) AS "totalBuildings",
       (SELECT COUNT(*)
          FROM rental_units u
          JOIN rental_buildings b ON b.id=u.building_id
          JOIN rental_properties p ON p.id=b.property_id
         WHERE p.company_id=$1) AS "totalUnits",
       (SELECT COUNT(*)
          FROM rental_units u
          JOIN rental_buildings b ON b.id=u.building_id
          JOIN rental_properties p ON p.id=b.property_id
         WHERE p.company_id=$1 AND u.status='OCCUPIED') AS "occupiedUnits",
       (SELECT COUNT(*) FROM rental_tenants WHERE company_id=$1) AS "totalTenants",
       (SELECT COALESCE(SUM(total), 0)
          FROM rental_invoices
         WHERE company_id=$1 AND status <> 'CANCELLED') AS "totalRevenue",
       (SELECT COALESCE(SUM(amount), 0)
          FROM rental_expenses
         WHERE company_id=$1 AND status='POSTED') AS "totalExpenses",
       (SELECT COUNT(*)
          FROM rental_maintenance_requests
         WHERE company_id=$1 AND status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS')) AS "pendingMaintenance"`,
    [companyId],
  );

  const row = result.rows[0];
  const totalUnits = Number(row.totalUnits);
  const occupiedUnits = Number(row.occupiedUnits);
  const totalRevenue = Number(row.totalRevenue);
  const totalExpenses = Number(row.totalExpenses);

  return {
    totalProperties: Number(row.totalProperties),
    totalBuildings: Number(row.totalBuildings),
    totalUnits,
    occupiedUnits,
    occupancyRate: totalUnits === 0 ? 0 : (occupiedUnits / totalUnits) * 100,
    totalTenants: Number(row.totalTenants),
    totalRevenue,
    totalExpenses,
    netIncome: totalRevenue - totalExpenses,
    pendingMaintenance: Number(row.pendingMaintenance),
  };
}
