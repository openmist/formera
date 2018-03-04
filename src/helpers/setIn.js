const setPath = ([key, ...next], value, obj = {}) => {
  const type = Number.isNaN(Number(key + 1)) ? {} : [];
  const nextObj = Object.assign(type, {
    ...obj,
    [key]: (next.length === 0 ? value : setPath(next, value, obj[key])),
  });

  // Todo: make this better!
  if (nextObj[key] === undefined || (nextObj[key] === Object(nextObj[key]) && Object.keys(nextObj[key]).length === 0)) {
    delete nextObj[key];
  }

  return nextObj;
};

export default (path, value, obj) => setPath(path.split('.'), value, obj);
