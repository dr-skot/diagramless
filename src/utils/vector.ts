import { inRange } from 'lodash';
import { mod } from './utils';

export function vectorAdd(v1: number[], v2: number[]) {
  return v1.map((element, i) => element + v2[i]);
}

export function vectorSubtract(v1: number[], v2: number[]) {
  return v1.map((element, i) => element - v2[i]);
}

// modulo that returns always positive results
// useful for wraparound with array indexes
//   mod(6, 5) === 1
//   mod(-2, 5) === 3;

export function vectorMod(vector: number[], mods: number[]) {
  return vector.map((element, i) => mod(element, mods[i]));
}

export function vectorFits(vector: number[], limits: number[]) {
  const fn = (result: boolean, element: number, i: number) =>
    result && inRange(element, 0, limits[i]);
  return vector.reduce(fn, true);
}
