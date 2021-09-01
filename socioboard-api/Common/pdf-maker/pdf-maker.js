import PdfPrinter from 'pdfmake';
import fs from 'fs';
import axios from 'axios';
import { Roboto } from './fonts/index.js';

class PdfMaker {
  constructor({ filepath }) {
    this.fonts = Roboto;
    this.font = 'Roboto';
    this.filepath = filepath;
    this.docDefinition = {};
    this.docDefinition.header = {};
    this.docDefinition.header.columns = [];
    this.docDefinition.content = [];
  }

  /**
     * TODO To create pdfmake object to generate pdf file
     * @description To create pdfmake object to generate pdf file
     * @return {object} Return object for pdf file
     */
  createPdfDoc() {
    this.printer = new PdfPrinter(this.fonts);

    return this;
  }

  /**
     * TODO To set language for pdf file
     * @description To set language for pdf file
     * @return {object} Return object for pdf file
     */
  setFont(language = 'en') {
    if (language == 'ar') this.font = 'Tajawal';

    return this;
  }

  /**
     * TODO To set header of pdf files
     * @description To set header of pdf files
     * @param {object} headerObj -Header of pdf
     * @return {object} Return object for pdf file
     */
  setTableHeaders(headerObj) {
    this.tableHeaders = [];
    this.tableHeadersOrder = [];
    for (let i = 0; i < headerObj.length; i++) {
      this.tableHeaders.push(headerObj[i].title);
      this.tableHeadersOrder.push(headerObj[i].id);
    }

    return this;
  }

  /**
     * TODO To set table body
     * @description To set table body
     * @param {object} bodyObj -Table body of pdf
     * @return {object} Return object for pdf file
     */
  setTableBody(bodyObj) {
    const widthType = this.tableHeaders.length < 10 ? '*' : `${(100 / this.tableHeaders.length).toFixed(2)}%`;
    const tableFontSize = this.tableHeaders.length < 7 ? 10 : this.tableHeaders.length < 13 ? 5 : 4.5;

    this.docDefinition.content.push({
      font: this.font,
      fontSize: tableFontSize,
      style: 'tableStyle',
      table: {
        headerRows: 1,
        widths: Array(this.tableHeaders.length).fill(widthType),
        body: this.getTableBody(bodyObj),
      },
    });
    this.docDefinition.styles = {
      tableStyle: {
        margin: [1, 1, 1, 1],
      },
    };

    return this;
  }

  /**
     * TODO To set bar chart in pdf
     * @description To set bar chart in pdf
     * @param {file} imgPath -Image path of bar chart
     * @return {object} Return object for pdf file
     */
  async setBarChart(imgPath) {
    const logoBase64Image = await this.getBase64Image(imgPath);

    this.docDefinition.content.push({
      alignment: 'center',
      image: logoBase64Image,
      fit: [400, 400],
    });

    return this;
  }

  /**
     * TODO To set app domain list
     * @description To set app domain list
     * @param {object} pdfAppDomainList -App domain list
     * @return {object} Return object for pdf file
     */
  setAppDomainList(pdfAppDomainList) {
    const max = Math.max(...(pdfAppDomainList.map((el) => Math.max(...(el.map((val) => val.length))))));

    let fontsize = 0;

    if (max < 25) {
      fontsize = 7.5;
    } else {
      fontsize = 6.3;
    }
    this.docDefinition.content.push({
      fontSize: fontsize,
      style: 'tableStyle',
      bold: true,
      layout: 'noBorders',
      table: {
        widths: Array(5).fill('*'),
        body: pdfAppDomainList,
      },
    });
  }

  /**
     * TODO To set end of pdf file generation
     * @description To set end of pdf file generation
     * @return {string} Return pdf file path
     */
  async end() {
    const pdfDoc = this.printer.createPdfKitDocument(this.docDefinition);
    // Writing it to disk
    const writeStream = fs.createWriteStream(this.filepath);

    pdfDoc.pipe(writeStream);
    pdfDoc.end();

    // to prevent write race condition
    await new Promise((resolve) => {
      writeStream.on('close', () => {
        resolve();
      });
    });

    return this.filepath;
  }

  /**
     * TODO To get table body of pdf
     * @description To get table body of pdf
     * @param {object} bodyObj Body object
     * @return {Array} Return array of table body
     */
  getTableBody(bodyObj) {
    const resultArr = [];

    for (let i = 0; i < bodyObj.length; i++) {
      const tableRow = bodyObj[i];
      const arrValueInTableHeaderOrder = [];

      for (let j = 0; j < this.tableHeadersOrder.length; j++) {
        arrValueInTableHeaderOrder.push(tableRow[this.tableHeadersOrder[j]] ?? '');
      }
      resultArr.push(arrValueInTableHeaderOrder);
    }

    // adding table header at the top
    resultArr.unshift(this.tableHeaders);

    return resultArr;
  }

  /**
     * TODO To set logo of pdf
     * @description To set logo of pdf
     * @param {url} imgUrl Image url
     */
  async setLogo(imgUrl) {
    const logoBase64 = await this.getBase64ImageFromURL(imgUrl);

    this.docDefinition.pageMargins = [40, 60, 40, 40];
    this.docDefinition.header.columns[1] = {
      image: logoBase64,
      fit: [150, 150],
      alignment: 'right',
      margin: [0, 20, 20, 0],
    };
  }

  /**
     * TODO To get base 64 image url
     * @description To get base 64 image url
     * @param {url} url Image url
     * @return {object} base 64 image url
     */
  async getBase64ImageFromURL(url) {
    const image = await axios.get(url, { responseType: 'arraybuffer' });
    const raw = Buffer.from(image.data).toString('base64');

    return `data:${image.headers['content-type']};base64,${raw}`;
  }

  /**
     * TODO To get base 64 image url
     * @description To get base 64 image url
     * @param {url} url Image url
     * @return {object} base 64 image url
     */
  async getBase64Image(img) {
    const pngRaw = fs.readFileSync(img).toString('base64');

    return `data:image/png;base64,${pngRaw}`;
  }

  /**
     * TODO To set document details
     * @description To set document details
     * @param {object} details document details
     * @return {object} pdf file instance
     */
  setDocDetails(details) {
    this.docDefinition.header.columns[0] = {
      font: this.font,
      margin: [30, 20],
      type: 'none',
      ol: details,
    };

    return this;
  }
}
export { PdfMaker };
