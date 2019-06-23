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
