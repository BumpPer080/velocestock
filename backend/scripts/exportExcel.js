import { generateExcelReport } from '../services/exportService.js';

const run = async () => {
  try {
    const filePath = await generateExcelReport();
    // eslint-disable-next-line no-console
    console.log(`Excel report saved to ${filePath}`);
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to generate Excel report', error);
    process.exit(1);
  }
};

run();

