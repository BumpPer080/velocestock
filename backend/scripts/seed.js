import dotenv from 'dotenv';
import { getConnection } from '../models/db.js';

dotenv.config();

const sampleProducts = [
  {
    qr_code: 'qr-20250101-ABC123',
    name: 'Power Drill',
    category: 'Tools',
    asset_code: 'AS-10001',
    import_date: '2025-01-10',
    quantity: 15,
    unit: 'pcs',
    image: null,
  },
  {
    qr_code: 'qr-20250102-XYZ456',
    name: 'Hydraulic Pump',
    category: 'Machines',
    asset_code: 'AS-20002',
    import_date: '2025-01-12',
    quantity: 6,
    unit: 'pcs',
    image: null,
  },
];

const run = async () => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM products');
    await Promise.all(
      sampleProducts.map((product) => connection.query(
        `INSERT INTO products
          (qr_code, name, category, asset_code, import_date, quantity, unit, image, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          product.qr_code,
          product.name,
          product.category,
          product.asset_code,
          product.import_date,
          product.quantity,
          product.unit,
          product.image,
        ],
      )),
    );
    await connection.commit();
    // eslint-disable-next-line no-console
    console.log('Database seeded with sample products');
  } catch (error) {
    await connection.rollback();
    // eslint-disable-next-line no-console
    console.error('Failed to seed database', error);
  } finally {
    connection.release();
    process.exit(0);
  }
};

run();
