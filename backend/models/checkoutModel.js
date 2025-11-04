import { getConnection } from './db.js';
import { findProductById } from './productModel.js';

const createError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export const checkoutProductByQr = async ({
  qrCode,
  quantity,
  userId,
  notes,
}) => {
  const connection = await getConnection();
  const numericQuantity = Number(quantity);
  const sanitizedNotes = typeof notes === 'string' ? notes.trim() || null : null;

  if (!qrCode) {
    throw createError('QR code is required', 400);
  }

  if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
    throw createError('Quantity must be greater than zero', 400);
  }

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `SELECT id, quantity FROM products WHERE qr_code = ? FOR UPDATE`,
      [qrCode],
    );

    if (!rows.length) {
      throw createError('Product not found for the provided QR code', 404);
    }

    const productRow = rows[0];
    const currentQuantity = Number(productRow.quantity) || 0;

    if (currentQuantity < numericQuantity) {
      throw createError('Insufficient stock to fulfill the checkout request', 409);
    }

    const remainingQuantity = currentQuantity - numericQuantity;

    await connection.execute(
      `UPDATE products
         SET quantity = ?, updated_at = NOW()
       WHERE id = ?`,
      [remainingQuantity, productRow.id],
    );

    const [insertResult] = await connection.execute(
      `INSERT INTO product_checkouts (product_id, user_id, quantity, notes, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [productRow.id, userId ?? null, numericQuantity, sanitizedNotes],
    );

    const [checkoutRows] = await connection.execute(
      `SELECT id, product_id, user_id, quantity, notes, created_at
       FROM product_checkouts
       WHERE id = ?`,
      [insertResult.insertId],
    );

    await connection.commit();

    const updatedProduct = await findProductById(productRow.id);
    const checkoutRow = checkoutRows[0] ?? null;

    return {
      product: updatedProduct,
      checkout: checkoutRow
        ? {
            id: checkoutRow.id,
            productId: checkoutRow.product_id,
            userId: checkoutRow.user_id,
            quantity: checkoutRow.quantity,
            notes: checkoutRow.notes,
            createdAt: checkoutRow.created_at,
          }
        : {
            id: insertResult.insertId,
            productId: productRow.id,
            userId: userId ?? null,
            quantity: numericQuantity,
            notes: sanitizedNotes,
            createdAt: null,
          },
      remainingQuantity,
    };
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      // eslint-disable-next-line no-console
      console.error('Failed to rollback checkout transaction', rollbackError);
    }
    throw error;
  } finally {
    connection.release();
  }
};
