import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  Tajawal: {
    normal: `${__dirname}/Tajawal-Regular.ttf`,
    bold: `${__dirname}/Tajawal-Bold.ttf`,
    italics: `${__dirname}/Tajawal-Ligth.ttf`,
    bolditalics: `${__dirname}/Roboto-ExtraBold.ttf`,
  },
};
