import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

import { listProducts, getDashboardSummary } from '../models/productModel.js';
import { listTransactions } from '../models/transactionModel.js';

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

export const generatePdfReport = async () => {
  await ensureDir();
  const summary = await getDashboardSummary();
  const transactions = await listTransactions();
  const filename = `report-${Date.now()}.pdf`;
  const filePath = path.join(exportDir, filename);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = doc.pipe(createWriteStream(filePath));

    doc.fontSize(20).text('VeloceStock Inventory Report', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();
    doc.text(`Total Products: ${summary.totalProducts}`);
    doc.text(`Low Stock Items: ${summary.lowStockItems}`);
    doc.moveDown();
    doc.fontSize(14).text('Recent Additions:', { underline: true });
    summary.recentProducts.forEach((product) => {
      doc.text(`- ${product.name} (${product.quantity} ${product.unit})`);
    });
    doc.moveDown();
    doc.fontSize(14).text('Latest Transactions:', { underline: true });
    transactions.slice(0, 10).forEach((tx) => {
      doc.fontSize(12).text(
        `${tx.created_at} | ${tx.type} | Product #${tx.product_id} | Qty: ${tx.quantity} | Note: ${tx.note || '—'}`,
      );
    });

    doc.end();

    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return filePath;
};
