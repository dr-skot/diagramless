import { XwdDirection } from './grid';

export type Vector = [number, number];

export const vector = (direction: XwdDirection): Vector =>
  direction === 'across' ? [0, 1] : [1, 0];

export const backVector = (direction: XwdDirection): Vector =>
  direction === 'across' ? [0, -1] : [-1, 0];

export const isPerpendicular = (direction: XwdDirection, vector: number[]) =>
  (direction === 'across' && vector[0]) || (direction === 'down' && vector[1]);
