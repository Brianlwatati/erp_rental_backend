import { pool } from "../config/database";

async function seed() {
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
      WHERE ec.company_id = 'default' AND ec.code = x.code
    );
  `);

  console.log("Seed completed.");
  await pool.end();
}

seed().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
