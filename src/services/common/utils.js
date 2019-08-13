import _ from "lodash";

export function includesEqual(array, item) {
  return !!_.find(array, x => _.isEqual(x, item));
}

// modulo that returns always positive results
// useful for wraparound with array indexes
//   mod(6, 5) === 1
//   mod(-2, 5) === 3;
//   mod(-5, 5) === 0;
export function mod(m, n) {
  return ((m % n) + n) % n;
}

// returns the keys of an object that have truthy values
//    obj = {a: true, b: false, c: "false", d: ""}
//    keysWithTrueValues(obj) === ["a", "c"];
export function keysWithTrueValues(object) {
  return _.keys(_.pickBy(object));
}

export function vectorAdd(v1, v2) {
  return v1.map((element, i) => element + v2[i]);
}

export function vectorSubtract(v1, v2) {
  return v1.map((element, i) => element - v2[i]);
}

export function vectorMod(vector, mods) {
  return vector.map((element, i) => mod(element, mods[i]));
}

export function vectorFits(vector, limits) {
  const fn = (result, element, i) => result && _.inRange(element, 0, limits[i]);
  return vector.reduce(fn, true);
}

export function getElement(array, indices) {
  return indices.reduce(
    (subarray, index) => (subarray ? subarray[index] : undefined),
    array
  );
}

export function nextOrLast(array, index) {
  return Math.min(index + 1, array.length - 1);
}

export function wrapFindIndex(array, index, test) {
  const backHalf = array.slice(index).findIndex(test);
  return backHalf > -1
    ? backHalf + index
    : array.slice(0, index).findIndex(test);
}

export function wrapFind(array, index, test) {
  const i = wrapFindIndex(array, index, test);
  return i < 0 ? undefined : array[i];
}

// capitalizes first letter of each word
export function capitalize(string) {
  return string
    .split(" ")
    .map(s => (s.length > 0 ? s[0].toUpperCase() + s.slice(1) : s))
    .join(" ");
}

// return the bounding rect of an element, relative to document
export function offsetRect(el) {
  const rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft,
    height: rect.height,
    width: rect.width
  };
}

// run map on values of an object
// fn is called with (value, key) so you can easily ignore the key
function objValueMap(obj, fn) {
  return Object.assign(
    ...Object.keys(obj).map(key => ({ [key]: fn(obj[key], key) }))
  );
}

// fits one DOM element on top of another
export function fitTo(anchor, el) {
  const rect = objValueMap(offsetRect(anchor), v => v + "px");
  Object.assign(el.style, rect);
}

function matchOrInRange(x, singleOrRange) {
  const range = singleOrRange.length
    ? singleOrRange
    : [singleOrRange, singleOrRange];
  return _.inRange(x, range[0], range[1] + 1);
}

// TODO move to separate module?
export const altKey = "altKey";
export const ctrlKey = "ctrlKey";
export function keyMatch(event, keyCodes, modifiers = []) {
  return (
    matchOrInRange(event.keyCode, keyCodes) &&
    (!event.ctrlKey || modifiers.indexOf(ctrlKey) > -1) &&
    (!event.altKey || modifiers.indexOf(altKey) > -1)
  );
}
