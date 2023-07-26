const parser = require('node-html-parser');

const isFirstLaunch = (html, id) => {
  const parse = parser.parse(html);
  const serachBy = 'div[data-test=upcoming-event-' + id + '-first-launch]';
  const isFirstLaunch = parse.querySelector(serachBy);

  return !!isFirstLaunch;
}

module.exports = { isFirstLaunch };
