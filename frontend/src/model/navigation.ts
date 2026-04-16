import { XwdDirection } from './grid';

export type Vector = [number, number];

export const LEFT: Vector = [0, -1];
export const RIGHT: Vector = [0, 1];
export const UP: Vector = [-1, 0];
export const DOWN: Vector = [1, 0];
export const ACROSS = RIGHT;

export const vectorFor = (direction: XwdDirection): Vector =>
  direction === 'across' ? [0, 1] : [1, 0];

export const backVectorFor = (direction: XwdDirection): Vector =>
  direction === 'across' ? [0, -1] : [-1, 0];

export const perp = (direction: XwdDirection): XwdDirection =>
  direction === 'across' ? 'down' : 'across';

export const isPerpendicular = (direction: XwdDirection, vector: Vector) =>
  (direction === 'across' && !vector[1]) || (direction === 'down' && !vector[0]);
