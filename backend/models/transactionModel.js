import { query, getConnection } from './db.js';

export const listTransactions = async () => query(
  `SELECT id, product_id, qr_code, type, quantity, note, created_at
   FROM transactions
   ORDER BY created_at DESC`,
);

export const createTransaction = async ({ productId, qrCode, type, quantity, note }) => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      `INSERT INTO transactions
        (product_id, qr_code, type, quantity, note, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [productId, qrCode, type, quantity, note],
    );
    const [rows] = await connection.execute(
      `SELECT id, product_id, qr_code, type, quantity, note, created_at
       FROM transactions
       WHERE id = ?`,
      [result.insertId],
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

