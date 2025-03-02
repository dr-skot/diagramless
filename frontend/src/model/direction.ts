import { XwdDirection } from './grid';

export type Vector = [number, number];

export const directionVector = (direction: XwdDirection): Vector =>
  direction === 'across' ? [0, 1] : [1, 0];

export const backVector = (direction: XwdDirection): Vector =>
  direction === 'across' ? [0, -1] : [-1, 0];

export const perp = (direction: XwdDirection): XwdDirection =>
  direction === 'across' ? 'down' : 'across';

export const isPerpendicular = (direction: XwdDirection, vector: Vector) =>
  (direction === 'across' && !vector[1]) || (direction === 'down' && !vector[0]);
