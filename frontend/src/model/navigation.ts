import { inRange, isEqual } from 'lodash';
import { vectorAdd, vectorFits, vectorMod, vectorSubtract } from '../utils/vector';
import { getElement } from '../utils/utils';
import { XwdDirection, XwdGrid } from './grid';

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

// --- Word finding ---

export function getWord(grid: XwdGrid, cursor: Vector, direction: Vector) {
  const [row, col] = cursor;
  const height = grid.length;
  if (height === 0) return [];
  const width = grid[0].length;

  const off = (row: number, col: number) => !inRange(row, 0, height) || !inRange(col, 0, width);
  const black = (row: number, col: number) => grid[row][col].isBlack;
  const add = (v1: Vector, v2: Vector): Vector => vectorAdd(v1, v2) as Vector;
  const subtract = (v1: Vector, v2: Vector): Vector => vectorSubtract(v1, v2) as Vector;

  if (black(row, col)) return null;

  let word = [];
  for (let pos = cursor; !off(...pos) && !black(...pos); pos = subtract(pos, direction)) {
    word.unshift(pos);
  }

  for (
    let pos = add(cursor, direction);
    !off(...pos) && !black(...pos);
    pos = add(pos, direction)
  ) {
    word.push(pos);
  }

  return word;
}

function isWhiteCell(grid: XwdGrid, pos: Vector) {
  const cell = getElement(grid, pos);
  return cell && !cell.isBlack;
}

export function isWordStart(cursor: Vector, direction: Vector, grid: XwdGrid) {
  const vector = direction;
  const oneBack = vectorSubtract(cursor, vector) as Vector,
    oneForward = vectorAdd(cursor, vector) as Vector,
    white = (pos: Vector) => isWhiteCell(grid, pos);
  return white(cursor) && !white(oneBack) && white(oneForward);
}
