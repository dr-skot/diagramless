import { times } from 'lodash';
import { cellIsCorrect, cellIsEmpty, emptyCell, revealMeta, XwdCell } from './cell';

export const not =
  (f: (...args: any[]) => any) =>
  (...args: any[]) =>
    !f(...args);

export type XwdDirection = 'across' | 'down';

export type XwdGrid = XwdCell[][];

export const newGrid = (height: number, width: number) =>
  times(height, () => times(width, () => emptyCell()));

export const gridHeight = (grid: XwdGrid) => grid.length;
export const gridWidth = (grid: XwdGrid) => grid[0]?.length || 0;

export type XwdCellCallback = (
  cell: XwdCell,
  indexes: { row: number; col: number; pos: number }
) => any;

export const mapCells = (callback: XwdCellCallback) => (grid: XwdGrid) => {
  let pos = 0;
  return grid.map((cells, row) =>
    cells.map((cell, col) => callback(cell, { row, col, pos: pos++ }))
  );
};

export const findCell = (callback: XwdCellCallback) => (grid: XwdGrid) => {
  let pos = 0;
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const cell = grid[row][col];
      if (callback(cell, { row, col, pos })) return { cell, row, col, pos };
      pos++;
    }
  }
  return null;
};

export const someCell = findCell;
export const everyCell = (callback: XwdCellCallback) => not(findCell(not(callback)));

export const revealDiagram = mapCells(revealMeta);
export const revealCircles = mapCells((cell) => ({ ...cell, cirle: cell.solution.circle }));

export const gridIsFilled = not(someCell(cellIsEmpty));
export const gridIsSolved = everyCell(cellIsCorrect);

export const setContents = (data: string[]) =>
  mapCells((cell, { pos }) =>
    ['.', ':'].includes(data[pos])
      ? { ...cell, isBlack: true }
      : { ...cell, content: data[pos] || '' }
  );
