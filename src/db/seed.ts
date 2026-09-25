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
    INSERT INTO rental_unit_types (
      company_id,
      name,
      code,
      bedrooms,
      bathrooms,
      description
    )
    SELECT
      'default',
      x.name,
      x.code,
      x.bedrooms,
      x.bathrooms,
      x.description
    FROM (VALUES
      (
        'Bedsitter',
        'BEDSITTER',
        0,
        1.0,
        'Compact self-contained unit with a combined living and sleeping area, kitchen space and private bathroom.'
      ),
      (
        'Studio',
        'STUDIO',
        0,
        1.0,
        'Open-plan self-contained unit with a combined living and sleeping area, kitchenette and private bathroom.'
      ),
      (
        '1 Bedroom',
        'ONE_BEDROOM',
        1,
        1.0,
        'One-bedroom residential unit with a separate bedroom, living area, kitchen and bathroom.'
      ),
      (
        '2 Bedroom',
        'TWO_BEDROOM',
        2,
        1.0,
        'Two-bedroom residential unit with a living area, kitchen and bathroom.'
      ),
      (
        '3 Bedroom',
        'THREE_BEDROOM',
        3,
        2.0,
        'Three-bedroom residential unit suitable for a family, with spacious living areas and two bathrooms.'
      ),
      (
        '4 Bedroom',
        'FOUR_BEDROOM',
        4,
        2.0,
        'Four-bedroom residential unit with spacious living areas, kitchen and two bathrooms.'
      ),
      (
        'Maisonette',
        'MAISONETTE',
        3,
        2.0,
        'Multi-level residential house with multiple bedrooms, living spaces, kitchen and bathrooms.'
      ),
      (
        'Townhouse',
        'TOWNHOUSE',
        4,
        3.0,
        'Modern multi-level residential property with multiple bedrooms, spacious living areas and private bathrooms.'
      ),
      (
        'House',
        'HOUSE',
        3,
        2.0,
        'Standalone residential house with bedrooms, living areas, kitchen and bathrooms.'
      ),
      (
        'Shop',
        'SHOP',
        0,
        1.0,
        'Commercial retail unit suitable for shops, boutiques and other customer-facing businesses.'
      ),
      (
        'Office',
        'OFFICE',
        0,
        1.0,
        'Commercial office space suitable for businesses, professional services and administrative operations.'
      ),
      (
        'Warehouse',
        'WAREHOUSE',
        0,
        1.0,
        'Large commercial storage and distribution space suitable for inventory and business operations.'
      ),
      (
        'Commercial Space',
        'COMMERCIAL_SPACE',
        0,
        1.0,
        'Flexible commercial space suitable for retail, office, service or other business activities.'
      ),
      (
        'Other',
        'OTHER',
        0,
        0.0,
        'Other rental unit type not covered by the standard unit categories.'
      )
    ) AS x(
      name,
      code,
      bedrooms,
      bathrooms,
      description
    )
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
