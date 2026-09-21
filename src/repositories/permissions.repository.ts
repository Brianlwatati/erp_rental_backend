import { query } from "../config/database";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const permissionsRepository = {
  async userHasPermission(
    userId: string,
    companyId: string,
    module: string,
    action: string,
  ): Promise<boolean> {
    if (!uuidPattern.test(userId) || !uuidPattern.test(companyId)) {
      return false;
    }

    const result = await query(
      `SELECT 1
       FROM rental_user_roles ur
       JOIN rental_users u ON u.id = ur.user_id
       JOIN rental_role_permissions rp ON rp.role_id = ur.role_id
       JOIN rental_permissions p ON p.id = rp.permission_id
       WHERE ur.user_id = $1
         AND u.company_id = $2
         AND p.code = $3
         AND u.status = 'ACTIVE'
       LIMIT 1`,
      [userId, companyId, `${module}:${action}`],
    );

    return (result.rowCount ?? 0) > 0;
  },
};
