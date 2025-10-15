import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import productRoutes from './routes/products.js';
import transactionRoutes from './routes/transactions.js';
import exportRoutes from './routes/exports.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

const ensureDirectory = (relativePath) => {
  const target = path.join(__dirname, relativePath);
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
};

ensureDirectory('./uploads/images');
ensureDirectory('./uploads/qrcodes');
ensureDirectory('./exports');

const allowedOrigin = process.env.FRONTEND_ORIGIN || '*';

app.use(
  cors({
    origin: allowedOrigin === '*' ? undefined : allowedOrigin,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));
app.use('/uploads/qrcodes', express.static(path.join(__dirname, 'uploads/qrcodes')));
app.use('/exports', express.static(path.join(__dirname, 'exports')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/export', exportRoutes);

app.use((err, req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${port}`);
});
