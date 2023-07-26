const parser = require('node-html-parser');

const getProductData = (html) => {
  const serachBy = 'script#__NEXT_DATA__';
  const parse = parser.parse(html);
  const dataRaw = parse.querySelector(serachBy);
  const data = JSON.parse(dataRaw.textContent);

  return data;
}

module.exports = { getProductData };
