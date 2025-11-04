import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { findProductByQr } from '../models/productModel.js';
import { checkoutProductByQr } from '../models/checkoutModel.js';
import { recordProductActivity } from '../models/activityModel.js';

const router = express.Router();

router.get('/lookup', requireAuth, requireRole('staff'), async (req, res, next) => {
  const qr = typeof req.query.qr === 'string' ? req.query.qr.trim() : '';
  if (!qr) {
    res.status(400).json({ message: 'QR code is required' });
    return;
  }

  try {
    const product = await findProductByQr(qr);
    if (!product) {
      res.status(404).json({ message: 'Product not found for the provided QR code' });
      return;
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, requireRole('staff'), async (req, res, next) => {
  const qr = typeof req.body.qr === 'string' ? req.body.qr.trim() : '';
  const numericQuantity = Number(req.body.quantity);
  const notes = typeof req.body.notes === 'string' ? req.body.notes.trim() : undefined;

  if (!qr) {
    res.status(400).json({ message: 'QR code is required' });
    return;
  }

  if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
    res.status(400).json({ message: 'Quantity must be greater than zero' });
    return;
  }

  try {
    const result = await checkoutProductByQr({
      qrCode: qr,
      quantity: numericQuantity,
      userId: req.user.id,
      notes,
    });

    if (!result?.product) {
      res.status(500).json({ message: 'Checkout completed but product data is unavailable' });
      return;
    }

    await recordProductActivity({
      productId: result.product.id,
      userId: req.user.id,
      action: 'checkout',
      details: JSON.stringify({
        quantity: numericQuantity,
        remainingQuantity: result.product.quantity,
        notes: notes || undefined,
      }),
    });

    res.status(201).json({
      product: result.product,
      checkout: result.checkout,
    });
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    next(error);
  }
});

export default router;
