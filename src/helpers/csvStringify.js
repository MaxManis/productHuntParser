const stringify = (arr) => {
  const res = arr.map(a => a.join(','));
  return res.join('\n');
}

module.exports = { stringify };
