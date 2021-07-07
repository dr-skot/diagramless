import { isEqual, pickBy } from 'lodash';

// don't break on parse errors
export const tryToParse = (json: string, ifError: any = undefined) => {
  try {
    return JSON.parse(json);
  } catch (e) {
    return ifError;
  }
};

// negative of function: not(f)(x) === !f(x)
export const not =
  (f: (...args: any[]) => any) =>
  (...args: any[]) =>
    !f(...args);

// modulo that returns always positive results
// useful for wraparound with array indexes
//   mod(6, 5) === 1
//   mod(-2, 5) === 3;
//   mod(-5, 5) === 0;
export function mod(m: number, n: number) {
  return ((m % n) + n) % n;
}

/* collections */

export function includesEqual(array: any[], item: any) {
  return array.some((x) => isEqual(x, item));
}

// returns the keys of an object that have truthy values
//    obj = {a: true, b: false, c: "false", d: ""}
//    keysWithTrueValues(obj) === ["a", "c"];
export function keysWithTrueValues(object: Record<any, any>) {
  return Object.keys(pickBy(object));
}

export function getElement(array: any[], indices: number[]): any {
  return indices.reduce((subarray, index) => (subarray ? subarray[index] : undefined), array);
}

export function nextOrLast(array: any[], index: number): number {
  return Math.min(index + 1, array.length - 1);
}

/* wrap find */

export function wrapFindIndex<T>(array: T[], index: number, test: (x: T) => any): number {
  const backHalf = array.slice(index).findIndex(test);
  return backHalf > -1 ? backHalf + index : array.slice(0, index).findIndex(test);
}

export function wrapFind<T>(array: T[], index: number, test: (x: T) => any): T | undefined {
  const i = wrapFindIndex(array, index, test);
  return i < 0 ? undefined : array[i];
}

// capitalizes first letter of each word
export function capitalize(string: string) {
  return string
    .split(' ')
    .map((s) => (s.length > 0 ? s[0].toUpperCase() + s.slice(1) : s))
    .join(' ');
}
