import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import express from 'express';
import multer from 'multer';
import QRCode from 'qrcode';

import {
  listProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getDashboardSummary,
} from '../models/productModel.js';
import { recordProductActivity, listProductActivities } from '../models/activityModel.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');
const imagesDir = path.join(uploadsDir, 'images');
const qrDir = path.join(uploadsDir, 'qrcodes');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const base = path.basename(file.originalname, ext).toLowerCase().replace(/\s+/g, '-');
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

const ensureQrForProduct = async (productId, qrCode) => {
  const filename = `${qrCode}.png`;
  const target = path.join(qrDir, filename);
  await QRCode.toFile(target, qrCode, { width: 256 });
  return filename;
};

router.get('/', async (req, res, next) => {
  try {
    const products = await listProducts({
      search: req.query.search,
      category: req.query.category,
      importDateFrom: req.query.importDateFrom,
      importDateTo: req.query.importDateTo,
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

router.get('/summary', async (req, res, next) => {
  try {
    const summary = await getDashboardSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

router.get('/activity', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { productId, action, limit } = req.query;
    const activities = await listProductActivities({
      productId: productId ? Number(productId) : undefined,
      action,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(activities);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await findProductById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/qrcode', async (req, res, next) => {
  try {
    const product = await findProductById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    const filename = `${product.qr_code}.png`;
    const filePath = path.join(qrDir, filename);
    if (!fs.existsSync(filePath)) {
      await ensureQrForProduct(product.id, product.qr_code);
    }
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/image', async (req, res, next) => {
  try {
    const product = await findProductById(req.params.id);
    if (!product || !product.image) {
      res.status(404).json({ message: 'Product image not found' });
      return;
    }
    const filePath = path.join(imagesDir, product.image);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: 'Product image not found' });
      return;
    }
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, upload.single('image'), async (req, res, next) => {
  try {
    const {
      name,
      category,
      assetCode,
      importDate,
      quantity,
      unit,
    } = req.body;

    const numericQuantity = Number(quantity ?? 0);
    if (Number.isNaN(numericQuantity)) {
      res.status(400).json({ message: 'Quantity must be a valid number' });
      return;
    }

    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = `${Math.floor(Math.random() * 1_000_000)}`.padStart(6, '0');
    const qrCode = `QR-${datePart}-${randomPart}`;

    const imageName = req.file ? req.file.filename : null;
    const product = await createProduct({
      qrCode,
      name,
      category,
      assetCode,
      importDate,
      quantity: numericQuantity,
      unit,
      image: imageName,
      createdBy: req.user.id,
    });

    await ensureQrForProduct(product.id, qrCode);
    await recordProductActivity({
      productId: product.id,
      userId: req.user.id,
      action: 'create',
      details: JSON.stringify({
        name,
        assetCode,
        quantity: numericQuantity,
      }),
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', requireAuth, upload.single('image'), async (req, res, next) => {
  try {
    const updates = {
      name: req.body.name,
      category: req.body.category,
      assetCode: req.body.assetCode,
      importDate: req.body.importDate,
      quantity: req.body.quantity ? Number(req.body.quantity) : undefined,
      unit: req.body.unit,
    };

    if (req.file) {
      updates.image = req.file.filename;
    }

    const product = await updateProduct(req.params.id, updates);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const changedFields = Object.entries(updates).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    if (Object.keys(changedFields).length) {
      await recordProductActivity({
        productId: product.id,
        userId: req.user.id,
        action: 'update',
        details: JSON.stringify({ updatedFields: changedFields }),
      });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const product = await findProductById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    await recordProductActivity({
      productId: product.id,
      userId: req.user.id,
      action: 'delete',
      details: JSON.stringify({
        name: product.name,
        assetCode: product.asset_code,
      }),
    });
    await deleteProduct(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
