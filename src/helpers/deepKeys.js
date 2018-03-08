const isObj = obj => Object.prototype.toString.call(obj) === '[object Object]';
const isArray = arr => Object.prototype.toString.call(arr) === '[object Array]';

export default (object) => {
  const result = [];

  const step = (parts, path = '') => Object.keys(parts).forEach((key) => {
    const value = parts[key];
    const nexPath = path.length > 0 ? `${path}.${key}` : key;
    if (isArray(value) || isObj(value)) {
      step(value, nexPath);
    } else if (isArray(parts)) {
      if (result.indexOf(path) === -1) {
        result.push(path);
      }
    } else {
      result.push(nexPath);
    }
  });

  step(object);

  return result;
};
