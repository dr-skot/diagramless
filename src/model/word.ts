import { ACROSS, DOWN, getWord, isWordStart } from '../services/xwdService';
import { mapCells, XwdDirection, XwdGrid } from './grid';
import { XwdWordLoc } from './puzzle';

export type XwdLoc = [number, number];
export type XwdWord = XwdLoc[];

export const findWord = (grid: XwdGrid, row: number, col: number, direction: XwdDirection) =>
  getWord(grid, [row, col], direction === 'across' ? ACROSS : DOWN) as XwdWord;

export const wordNumber = (grid: XwdGrid, word: XwdWord) => {
  if (!word?.length) return null;
  const [i, j] = word[0];
  return grid[i][j].number;
};

export const clueNumber = (grid: XwdGrid, row: number, col: number, direction: XwdDirection) =>
  wordNumber(grid, findWord(grid, row, col, direction));

export const wordStartsAt = (
  grid: XwdGrid,
  row: number,
  col: number,
  direction?: XwdDirection
): boolean =>
  direction
    ? isWordStart([row, col], direction === 'across' ? ACROSS : DOWN, grid)
    : wordStartsAt(grid, row, col, 'across') || wordStartsAt(grid, row, col, 'down');
export const getWordStarts = (grid: XwdGrid, number: string, direction: XwdDirection) => {
  const wordStarts: number[][] = [];
  mapCells((cell, { row, col }) => {
    if (cell.number === number && wordStartsAt(grid, row, col, direction)) {
      wordStarts.push([row, col]);
    }
  })(grid);
  return wordStarts;
};

export const getCellsInWord = (grid: XwdGrid, wordLocator: XwdWordLoc) => {
  const { number, direction } = wordLocator;
  return getWordStarts(grid, number, direction)
    .map(([row, col]) => findWord(grid, row, col, direction))
    .flat();
};

export const numberWordStarts = (grid: XwdGrid) => {
  let counter = 0;
  return mapCells((cell, { row, col }) =>
    wordStartsAt(grid, row, col) ? { ...cell, number: `${++counter}` } : cell
  )(grid);
};

export const wordIncludes = (row: number, col: number, word: XwdWord) => {
  word.some(([i, j]) => row === i && col === j);
};
