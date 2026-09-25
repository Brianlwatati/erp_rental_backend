import { pool } from "../config/database";

async function seed() {
  // Seed default expense categories
  await pool.query(`
    INSERT INTO rental_expense_categories (company_id, name, code)
    SELECT 'default', x.name, x.code
    FROM (VALUES
      ('Maintenance', 'MAINTENANCE'),
      ('Utilities', 'UTILITIES'),
      ('Security', 'SECURITY'),
      ('Cleaning', 'CLEANING'),
      ('Taxes', 'TAX'),
      ('Insurance', 'INSURANCE'),
      ('Staff', 'STAFF'),
      ('Repairs', 'REPAIRS'),
      ('Other', 'OTHER')
    ) AS x(name, code)
    WHERE NOT EXISTS (
      SELECT 1
      FROM rental_expense_categories ec
      WHERE ec.company_id = 'default'
        AND ec.code = x.code
    );
  `);

  // Seed default rental unit types
  await pool.query(`
    INSERT INTO rental_unit_types (company_id, name, code)
    SELECT 'default', x.name, x.code
    FROM (VALUES
      ('Bedsitter', 'BEDSITTER'),
      ('Studio', 'STUDIO'),
      ('1 Bedroom', 'ONE_BEDROOM'),
      ('2 Bedroom', 'TWO_BEDROOM'),
      ('3 Bedroom', 'THREE_BEDROOM'),
      ('4 Bedroom', 'FOUR_BEDROOM'),
      ('Maisonette', 'MAISONETTE'),
      ('Townhouse', 'TOWNHOUSE'),
      ('House', 'HOUSE'),
      ('Shop', 'SHOP'),
      ('Office', 'OFFICE'),
      ('Warehouse', 'WAREHOUSE'),
      ('Commercial Space', 'COMMERCIAL_SPACE'),
      ('Other', 'OTHER')
    ) AS x(name, code)
    WHERE NOT EXISTS (
      SELECT 1
      FROM rental_unit_types ut
      WHERE ut.company_id = 'default'
        AND ut.code = x.code
    );
  `);

  console.log("Seed completed successfully.");

  await pool.end();
}

seed().catch(async (error) => {
  console.error("Seed failed:", error);
  await pool.end();
  process.exit(1);
});
