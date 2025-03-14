import { range } from 'lodash';
import { mapCells, XwdGrid } from './grid';
import { XwdPuzzle } from './puzzle';
import { wordStartsAt } from './word';

export type XwdNumbering = 'from bottom' | 'from top' | 'from both ends' | 'off';

export const countWordStarts = (grid: XwdGrid) => {
  let count = 0;
  mapCells((cell, { row, col }) => {
    if (wordStartsAt(grid, row, col)) count++;
  })(grid);
  return count;
};

export const numberWordStarts = (grid: XwdGrid, numbers?: number[]) => {
  let i = 0;
  return mapCells((cell, { row, col }) =>
    wordStartsAt(grid, row, col)
      ? { ...cell, number: `${numbers ? numbers[i++] || '' : ++i}` }
      : cell
  )(grid);
};

export const getNumbers = (
  wordCount: number,
  clueCount: number,
  numbering: XwdNumbering
): number[] | undefined => {
  switch (numbering) {
    case 'off':
      return undefined;
    case 'from top':
      return range(1, wordCount + 1);
    case 'from bottom':
      return range(clueCount + 1 - wordCount, clueCount + 1);
    case 'from both ends':
      const midpoint = Math.ceil(wordCount / 2);
      return range(1, midpoint + 1).concat(
        range(clueCount + 1 - (wordCount - midpoint), clueCount + 1)
      );
  }
};

export const numberPuzzle = (puzzle: XwdPuzzle) => {
  if (puzzle.autonumber === 'off') return puzzle;
  const wordCount = countWordStarts(puzzle.grid);
  const clueCount = Math.max(...puzzle.clues.map(clue => parseInt(clue.number) || 0));
  const grid = numberWordStarts(puzzle.grid, getNumbers(wordCount, clueCount, puzzle.autonumber));
  return { ...puzzle, grid };
};
