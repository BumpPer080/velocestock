import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import ExcelJS from 'exceljs';

import { listProducts } from '../models/productModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const exportDir = path.join(__dirname, '..', 'exports');

const ensureDir = async () => {
  try {
    await fs.mkdir(exportDir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
};

export const generateExcelReport = async () => {
  await ensureDir();
  const products = await listProducts();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Products');
  sheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'QR Code', key: 'qr_code', width: 25 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Asset Code', key: 'asset_code', width: 20 },
    { header: 'Import Date', key: 'import_date', width: 15 },
    { header: 'Quantity', key: 'quantity', width: 12 },
    { header: 'Unit', key: 'unit', width: 10 },
  ];
  sheet.addRows(products);
  const filename = `products-${Date.now()}.xlsx`;
  const filePath = path.join(exportDir, filename);
  await workbook.xlsx.writeFile(filePath);
  return filePath;
};
