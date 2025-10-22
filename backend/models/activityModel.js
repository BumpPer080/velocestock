import { query } from './db.js';

export const recordProductActivity = async ({
  productId,
  userId,
  action,
  details,
}) => {
  await query(
    `INSERT INTO product_activity_logs
      (product_id, user_id, action, details, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [productId ?? null, userId ?? null, action, details ?? null],
  );
};

const clampLimit = (limit) => {
  const numeric = Number(limit);
  if (Number.isNaN(numeric) || numeric <= 0) return 50;
  return Math.min(Math.floor(numeric), 200);
};

export const listProductActivities = async ({
  productId,
  action,
  limit,
} = {}) => {
  const clauses = [];
  const params = [];

  if (productId) {
    clauses.push('pal.product_id = ?');
    params.push(productId);
  }

  if (action) {
    clauses.push('pal.action = ?');
    params.push(action);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const sql = `
    SELECT
      pal.id,
      pal.product_id AS productId,
      pal.user_id AS userId,
      pal.action,
      pal.details,
      pal.created_at AS createdAt,
      p.name AS productName,
      p.asset_code AS assetCode,
      u.username AS userUsername,
      u.display_name AS userDisplayName,
      u.role AS userRole
    FROM product_activity_logs pal
    LEFT JOIN products p ON p.id = pal.product_id
    LEFT JOIN users u ON u.id = pal.user_id
    ${where}
    ORDER BY pal.created_at DESC
    LIMIT ?
  `;

  params.push(clampLimit(limit));

  return query(sql, params);
};

