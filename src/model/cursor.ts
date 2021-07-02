import { gridHeight, gridWidth, isFilled, XwdDirection } from './grid';
import { getWord, LEFT, moveOnGrid, NEXT_LINE, RIGHT } from '../services/xwdService';
import { includesEqual, mod } from '../services/common/utils';
import { findWord, wordNumber, wordStartsAt } from './word';
import { cellIsEmpty } from './cell';
import { XwdPuzzle } from './puzzle';

export interface XwdCursor {
  row: number;
  col: number;
  direction: XwdDirection;
}

export const perp = (direction: XwdDirection): XwdDirection =>
  direction === 'across' ? 'down' : 'across';

export const currentCell = (puzzle: XwdPuzzle) => puzzle.grid[puzzle.cursor.row][puzzle.cursor.col];

export const currentWord = (puzzle: XwdPuzzle) =>
  findWord(puzzle.grid, puzzle.cursor.row, puzzle.cursor.col, puzzle.cursor.direction);

export const crossingWord = (puzzle: XwdPuzzle) =>
  findWord(puzzle.grid, puzzle.cursor.row, puzzle.cursor.col, perp(puzzle.cursor.direction));

export const wordContains = (puzzle: XwdPuzzle, row: number, col: number) => {
  return includesEqual(currentWord(puzzle) || [], [row, col]);
};

// TODO should these take and return a puzzle?
export const setCursor = (cursor: XwdCursor, row: number, col: number) => ({ ...cursor, row, col });
export const toggleDirection = (cursor: XwdCursor) => ({
  ...cursor,
  direction: perp(cursor.direction),
});

export const setPosition = (puzzle: XwdPuzzle, pos: number) => {
  const width = gridWidth(puzzle.grid);
  const row = Math.floor(pos / width);
  const col = pos % width;
  return {
    ...puzzle,
    cursor: { ...puzzle.cursor, row, col },
  };
};

export const addToCursor = (puzzle: XwdPuzzle, i: number, j: number) => ({
  ...puzzle,
  cursor: {
    ...puzzle.cursor,
    row: mod(puzzle.cursor.row + i, gridHeight(puzzle.grid)),
    col: mod(puzzle.cursor.col + j, gridWidth(puzzle.grid)),
  },
});

export const clueNumber = (puzzle: XwdPuzzle, direction: XwdDirection) => {
  const { grid, cursor } = puzzle;
  const word = cursor.direction === direction ? currentWord(puzzle) : crossingWord(puzzle);
  return wordNumber(grid, word);
};

export const goToWord = (puzzle: XwdPuzzle, number: string, direction: XwdDirection) => {
  const { grid } = puzzle;
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      if (grid[row][col].number === number) {
        return { ...puzzle, cursor: { row, col, direction } };
      }
    }
  }
  return puzzle;
};

export interface NextWordOptions {
  backward?: boolean;
  eitherDirection?: boolean;
  skipFilled?: boolean;
}
export const goToNextWord = (puzzle: XwdPuzzle, options: NextWordOptions = {}): XwdPuzzle => {
  const { grid, cursor } = puzzle;
  const backward = !!options.backward,
    eitherDirection = !!options.eitherDirection,
    word = currentWord(puzzle),
    start = eitherDirection || !word ? [cursor.row, cursor.col] : word[0],
    gridSize = [gridHeight(grid), gridWidth(grid)];
  let direction = cursor.direction;
  const startOfWord = moveOnGrid(start, backward ? LEFT : RIGHT, gridSize, {
    atLineEnd: NEXT_LINE,
    onPuzzleWrap: () => {
      direction = perp(direction);
    },
    until: ([row, col]: number[]) =>
      wordStartsAt(grid, row, col, eitherDirection ? undefined : direction),
  });
  // TODO DRY this out there's similar in puzzle.jsx moveInWord(grid, policy, word)
  const newWord = getWord(grid, startOfWord, direction);
  if (!newWord) return puzzle;
  const emptyCell = newWord?.find(([i, j]: number[]) => cellIsEmpty(grid[i][j]));
  const newPos = emptyCell || newWord[0];
  //console.log({ newWord, emptyCell, newPos });
  const newCursor = { row: newPos[0], col: newPos[1], direction };
  const newPuzzle = { ...puzzle, cursor: newCursor };
  return !emptyCell && options.skipFilled && !isFilled(grid)
    ? goToNextWord(newPuzzle, options)
    : newPuzzle;
};

export const cursorShadowFallsOn = (cursor: XwdCursor, row: number, col: number) =>
  cursor.direction === 'across' ? row === cursor.row : col === cursor.col;
