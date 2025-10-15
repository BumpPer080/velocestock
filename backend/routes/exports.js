import express from 'express';

import { generateExcelReport, generatePdfReport } from '../services/exportService.js';

const router = express.Router();

router.get('/excel', async (req, res, next) => {
  try {
    const filePath = await generateExcelReport();
    res.download(filePath);
  } catch (error) {
    next(error);
  }
});

router.get('/pdf', async (req, res, next) => {
  try {
    const filePath = await generatePdfReport();
    res.download(filePath);
  } catch (error) {
    next(error);
  }
});

export default router;
