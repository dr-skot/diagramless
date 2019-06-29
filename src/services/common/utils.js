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
