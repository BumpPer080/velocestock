import express from 'express';

import { listTransactions, createTransaction } from '../models/transactionModel.js';
import { findProductById, adjustProductQuantity } from '../models/productModel.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const transactions = await listTransactions();
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { productId, type, quantity, note } = req.body;
    if (!productId || !type || !quantity) {
      res.status(400).json({ message: 'productId, type, and quantity are required' });
      return;
    }
    const product = await findProductById(productId);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    const numericQuantity = Number(quantity);
    if (Number.isNaN(numericQuantity) || numericQuantity <= 0) {
      res.status(400).json({ message: 'Quantity must be a positive number' });
      return;
    }
    const direction = type === 'OUT' ? -numericQuantity : numericQuantity;
    if (type === 'OUT' && product.quantity < numericQuantity) {
      res.status(400).json({ message: 'Insufficient stock for this transaction' });
      return;
    }
    await adjustProductQuantity(productId, direction);
    const transaction = await createTransaction({
      productId,
      qrCode: product.qr_code,
      type,
      quantity: numericQuantity,
      note,
    });
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
});

export default router;

