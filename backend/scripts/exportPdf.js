import { generatePdfReport } from '../services/exportService.js';

const run = async () => {
  try {
    const filePath = await generatePdfReport();
    // eslint-disable-next-line no-console
    console.log(`PDF report saved to ${filePath}`);
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to generate PDF report', error);
    process.exit(1);
  }
};

run();

