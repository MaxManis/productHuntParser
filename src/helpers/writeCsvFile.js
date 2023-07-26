const fs = require('fs');
const path = require('path');

const { FILES_DIR_NAME } = require('../config/config');

const writeCsvFile = (data, fileName) => { // data: string (CSV string), fileName: string
  const pathToNewCSVFile = path.join(process.execPath, '..', FILES_DIR_NAME, fileName);
  fs.writeFileSync(pathToNewCSVFile, data);
};

module.exports = { writeCsvFile };
