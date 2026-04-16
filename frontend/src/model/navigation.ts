import { isEqual } from 'lodash';
import { vectorAdd, vectorFits, vectorMod, vectorSubtract } from '../utils/vector';
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

// --- Grid movement ---

export const STOP = 'STOP',
  WRAP_AROUND = 'WRAP_AROUND',
  NEXT_LINE = 'NEXT_LINE';

export interface MoveOnGridOptions {
  atLineEnd: 'STOP' | 'WRAP_AROUND' | 'NEXT_LINE';
  onPuzzleWrap: () => void;
  until: (pos: Vector) => boolean;
}

export function moveOnGrid(
  start: Vector,
  direction: Vector,
  gridSize: Vector,
  options: Partial<MoveOnGridOptions> = {}
): Vector {
  const { atLineEnd, onPuzzleWrap, until } = options;

  if (until) {
    return moveOnGridUntil(until, start, direction, gridSize, {
      atLineEnd,
      onPuzzleWrap,
    });
  }

  const vector = direction;
  const onGrid = (position: Vector) => vectorFits(position, gridSize);
  const wrap = (position: Vector) => vectorMod(position, gridSize);

  const unwrapped = vectorAdd(start, vector) as Vector;
  if (onGrid(unwrapped)) return unwrapped;
  if (atLineEnd === STOP) return start;

  const wrapped = wrap(unwrapped) as Vector;
  if (atLineEnd !== NEXT_LINE) return wrapped;

  const crossVector = vector.slice().reverse();
  const lineAdvanced = vectorAdd(wrapped, crossVector) as Vector;
  if (onGrid(lineAdvanced)) return lineAdvanced;

  const puzzleWrapped = wrap(lineAdvanced);
  if (onPuzzleWrap) onPuzzleWrap();
  return puzzleWrapped as Vector;
}

export function moveOnGridUntil(
  found: (pos: Vector) => boolean,
  start: Vector,
  direction: Vector,
  gridSize: Vector,
  options: Partial<MoveOnGridOptions> = {}
) {
  let position = start,
    lastPosition;
  do {
    lastPosition = position;
    position = moveOnGrid(position, direction, gridSize, options);
  } while (
    !found(position) &&
    !isEqual(position, lastPosition) &&
    !isEqual(position, start)
  );
  return position;
}
