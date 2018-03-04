const isObj = obj => Object.prototype.toString.call(obj) === '[object Object]';
const isArray = arr => Object.prototype.toString.call(arr) === '[object Array]';

// Todo: clean this up and make it better
const step = (parts, path = '') => [].concat(...Object.keys(parts).map(key => (
  isArray(parts[key]) || isObj(parts[key]) ? step(parts[key], `${path}${key}.`) : path + key
)));

export default object => step(object);
