import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  Roboto: {
    normal: `${__dirname}/Roboto-Regular.ttf`,
    bold: `${__dirname}/Roboto-Medium.ttf`,
    italics: `${__dirname}/Roboto-Italic.ttf`,
    bolditalics: `${__dirname}/Roboto-MediumItalic.ttf`,
  },
};
