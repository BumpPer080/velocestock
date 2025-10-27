import express from 'express';

import { generateExcelReport } from '../services/exportService.js';

const router = express.Router();

router.get('/excel', async (req, res, next) => {
  try {
    const filePath = await generateExcelReport();
    res.download(filePath);
  } catch (error) {
    next(error);
  }
});

export default router;
