import { query, getConnection } from './db.js';

export const listProducts = async (filters = {}) => {
  const clauses = [];
  const params = [];

  if (filters.search) {
    clauses.push('(p.name LIKE ? OR p.category LIKE ? OR p.asset_code LIKE ?)');
    const wildcard = `%${filters.search}%`;
    params.push(wildcard, wildcard, wildcard);
  }

  if (filters.category) {
    clauses.push('p.category = ?');
    params.push(filters.category);
  }

  if (filters.importDateFrom) {
    clauses.push('p.import_date >= ?');
    params.push(filters.importDateFrom);
  }

  if (filters.importDateTo) {
    clauses.push('p.import_date <= ?');
    params.push(filters.importDateTo);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const sql = `
    SELECT p.id, p.qr_code, p.name, p.category, p.asset_code, p.import_date, p.quantity, p.unit,
           p.image, p.created_at, p.updated_at, p.created_by,
           u.display_name AS created_by_name, u.username AS created_by_username
    FROM products p
    LEFT JOIN users u ON u.id = p.created_by
    ${where}
    ORDER BY p.created_at DESC
  `;

  return query(sql, params);
};

export const findProductById = async (id) => {
  const rows = await query(
    `SELECT p.id, p.qr_code, p.name, p.category, p.asset_code, p.import_date, p.quantity, p.unit,
            p.image, p.created_at, p.updated_at, p.created_by,
            u.display_name AS created_by_name, u.username AS created_by_username
     FROM products p
     LEFT JOIN users u ON u.id = p.created_by
     WHERE p.id = ?`,
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
    createdBy,
  } = payload;

  // ✅ ป้องกัน undefined → แปลงเป็น null
  const safeQrCode = qrCode ?? null;
  const safeName = name ?? null;
  const safeCategory = category ?? null;
  const safeAssetCode = assetCode ?? null;
  const safeImportDate = importDate ?? null;
  const safeQuantity = quantity ?? 0;
  const safeUnit = unit ?? null;
  const safeImage = image ?? null;
  const safeCreatedBy = createdBy ?? null;

  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO products
        (qr_code, name, category, asset_code, import_date, quantity, unit, image, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        safeQrCode,
        safeName,
        safeCategory,
        safeAssetCode,
        safeImportDate,
        safeQuantity,
        safeUnit,
        safeImage,
        safeCreatedBy,
      ],
    );

    const [inserted] = await connection.execute(
      `SELECT p.id, p.qr_code, p.name, p.category, p.asset_code, p.import_date, p.quantity, p.unit,
              p.image, p.created_at, p.updated_at, p.created_by,
              u.display_name AS created_by_name, u.username AS created_by_username
       FROM products p
       LEFT JOIN users u ON u.id = p.created_by
       WHERE p.id = ?`,
      [result.insertId],
    );

    await connection.commit();
    return inserted[0];
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
    createdBy: 'created_by',
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
