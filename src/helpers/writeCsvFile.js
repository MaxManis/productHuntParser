const fs = require('fs');
const path = require('path');

const { FILES_DIR_NAME } = require('../config/config');

const writeCsvFile = (data, fileName, debug = false) => { // data: string (CSV string), fileName: string
  let pathToNewCSVFile = path.join(process.execPath, '..', FILES_DIR_NAME, fileName);

  if (debug) {
    pathToNewCSVFile = path.join(__dirname, FILES_DIR_NAME, fileName);
  }

  fs.writeFileSync(pathToNewCSVFile, data);
};

module.exports = { writeCsvFile };
