import { query, getConnection } from './db.js';

export const listProducts = async (filters = {}) => {
  const clauses = [];
  const params = [];

  if (filters.search) {
    clauses.push('(name LIKE ? OR category LIKE ? OR asset_code LIKE ?)');
    const wildcard = `%${filters.search}%`;
    params.push(wildcard, wildcard, wildcard);
  }

  if (filters.category) {
    clauses.push('category = ?');
    params.push(filters.category);
  }

  if (filters.importDateFrom) {
    clauses.push('import_date >= ?');
    params.push(filters.importDateFrom);
  }

  if (filters.importDateTo) {
    clauses.push('import_date <= ?');
    params.push(filters.importDateTo);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const sql = `
    SELECT id, qr_code, name, category, asset_code, import_date, quantity, unit,
           image, created_at, updated_at
    FROM products
    ${where}
    ORDER BY created_at DESC
  `;

  return query(sql, params);
};

export const findProductById = async (id) => {
  const rows = await query(
    `SELECT id, qr_code, name, category, asset_code, import_date, quantity, unit,
            image, created_at, updated_at
     FROM products
     WHERE id = ?`,
    [id],
  );
  return rows[0] ?? null;
};

export const createProduct = async (payload) => {
  const {
    qrCode,
    name,
    category,
    assetCode,
    importDate,
    quantity,
    unit,
    image,
  } = payload;

  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      `INSERT INTO products
        (qr_code, name, category, asset_code, import_date, quantity, unit, image, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [qrCode, name, category, assetCode, importDate, quantity, unit, image],
    );
    const inserted = await connection.execute(
      `SELECT id, qr_code, name, category, asset_code, import_date, quantity, unit,
              image, created_at, updated_at
       FROM products
       WHERE id = ?`,
      [result.insertId],
    );
    await connection.commit();
    return inserted[0][0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateProduct = async (id, payload) => {
  const fields = [];
  const params = [];

  const columnAlias = {
    assetCode: 'asset_code',
    importDate: 'import_date',
  };

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    switch (key) {
      case 'name':
      case 'category':
      case 'assetCode':
      case 'importDate':
      case 'quantity':
      case 'unit':
      case 'image':
        fields.push(`${columnAlias[key] ?? key} = ?`);
        params.push(value);
        break;
      default:
        break;
    }
  });

  if (!fields.length) {
    return findProductById(id);
  }

  params.push(id);
  await query(
    `UPDATE products
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = ?`,
    params,
  );

  return findProductById(id);
};

export const deleteProduct = (id) => query('DELETE FROM products WHERE id = ?', [id]);

export const getDashboardSummary = async () => {
  const [counts] = await query(
    `SELECT
        COUNT(*) AS totalProducts,
        SUM(CASE WHEN quantity <= 5 THEN 1 ELSE 0 END) AS lowStockItems
     FROM products`,
  );

  const recent = await query(
    `SELECT id, name, quantity, unit, created_at
     FROM products
     ORDER BY created_at DESC
     LIMIT 5`,
  );

  return {
    totalProducts: counts.totalProducts ?? 0,
    lowStockItems: counts.lowStockItems ?? 0,
    recentProducts: recent,
  };
};

export const adjustProductQuantity = async (productId, adjustment) => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      `UPDATE products
       SET quantity = quantity + ?, updated_at = NOW()
       WHERE id = ?`,
      [adjustment, productId],
    );
    const [rows] = await connection.execute(
      `SELECT id, quantity
       FROM products
       WHERE id = ?`,
      [productId],
    );
    await connection.commit();
    return rows[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
