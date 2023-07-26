const uniqObjInArray = (array, byField = 'id') => {
  const res = [];

  for (let i = 0; i < array.length; i++) {
    const isInRes = res.find(item => item[byField] === array[i][byField]);

    if (!isInRes) {
      res.push(array[i]);
    }
  }

  return res;
}

module.exports = { uniqObjInArray };
