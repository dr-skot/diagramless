import { findCell, mapCells, newGrid, XwdCellCallback, XwdDirection, XwdGrid } from './grid';
import { currentCell, currentWord, XwdCursor } from './cursor';
import { enforceSymmetry, getSisterCell, XwdSymmetry } from './symmetry';
import { ACROSS, parseRelatedClues, puzzleFromFileData } from '../services/xwdService';
import { getCellsInWord, wordIncludes, wordNumber, XwdLoc } from './word';
import { XwdCell } from './cell';
import { nextOrLast, wrapFindIndex } from '../utils/utils';
import { numberPuzzle, XwdNumbering } from './numbering';

export interface XwdClue {
  number: string;
  direction: XwdDirection;
  text: string;
}

export interface XwdWordLoc {
  number: string;
  direction: XwdDirection;
}

export interface XwdPuzzle {
  width: number;
  height: number;
  grid: XwdGrid;
  cursor: XwdCursor;
  clues: XwdClue[];
  time: number;
  symmetry: XwdSymmetry;
  autonumber: XwdNumbering;
  title: string;
  author: string;
  copyright: string;
  note: string;
  date: string;
}

export const emptyPuzzle: XwdPuzzle = {
  width: 0,
  height: 0,
  grid: newGrid(0, 0),
  cursor: { row: 0, col: 0, direction: 'across' },
  time: 0,
  clues: [],
  symmetry: null,
  autonumber: 'from both ends',
  title: '',
  author: '',
  copyright: '',
  note: '',
  date: '',
};

// TODO read clues from data so they can be more easily accessed by number/direction
export const puzzleFromFile = (buffer: ArrayBuffer) => puzzleFromData(puzzleFromFileData(buffer));

interface PuzzleData {
  label: string;
  width: number;
  height: number;
  solution: string[];
  guesses: string[];
  clues: { number: string; direction: [number, number]; clue: string }[];
  numbers: (number | null)[];
  author: string;
  title: string;
  copyright: string;
  note: string;
  extras: { GRBS?: any; RTBL?: any[]; GEXT?: any[] };
  date: string;
}

export const puzzleFromData = (data?: PuzzleData): XwdPuzzle | null => {
  if (!data) return null;

  const grid = mapCells((cell, { pos }) => {
    const answer = data.solution[pos];
    const isBlack = [':', '.'].includes(answer);
    return {
      ...cell,
      solution: {
        content: isBlack ? '' : answer,
        isBlack,
        number: `${data.numbers[pos] || ''}`,
        circle: data.extras.GEXT && (data.extras.GEXT[pos] & 0x80) === 0x80,
      },
    };
  })(newGrid(data.height, data.width));

  const firstCell = findCell((cell) => !cell.isBlack)(grid);
  const cursor: XwdCursor = {
    row: firstCell?.row || 0,
    col: firstCell?.col || 0,
    direction: 'across',
  };

  return {
    ...emptyPuzzle,
    grid,
    cursor,
    clues: data.clues.map((old) => ({
      number: old.number,
      direction: old.direction[0] === 0 ? 'across' : 'down',
      text: old.clue,
    })),
    width: data.width,
    height: data.height,
    title: data.title,
    author: data.author,
    copyright: data.copyright,
    note: data.note,
    date: data.date,
  };
};

export const currentClue = (puzzle: XwdPuzzle, direction = puzzle.cursor.direction) => {
  const word = currentWord(puzzle);
  const number = wordNumber(puzzle.grid, word);
  if (!number) return null;
  return puzzle.clues.find((clue) => clue.number === number && clue.direction === direction);
};

export type XwdCellChange = Partial<XwdCell> | ((cell: XwdCell) => Partial<XwdCell>);
export const changeCell = (cell: XwdCell, change: XwdCellChange): XwdCell => {
  const changes = typeof change === 'function' ? change(cell) : change;
  return { ...cell, ...changes };
};

export const gridReplaceCell =
  (row: number, col: number, newCell: XwdCell, symmetry: XwdSymmetry = null) =>
  (grid: XwdGrid): XwdGrid => {
    const sister = getSisterCell(grid, row, col, symmetry);
    const newSister =
      !sister || !sister.isBlack === !newCell.isBlack
        ? sister
        : { ...sister, isBlack: newCell.isBlack && symmetry };
    return mapCells((cell, index) =>
      index.row === row && index.col === col ? newCell : cell === sister ? newSister : cell
    )(grid);
  };

export const changeCells =
  (change: XwdCellChange) =>
  (filter: XwdCellCallback = () => true) =>
  (puzzle: XwdPuzzle): XwdPuzzle => {
    let grid = puzzle.grid;
    let pos = 0;
    for (let row = 0; row < puzzle.height; row++) {
      for (let col = 0; col < puzzle.width; col++) {
        const cell = grid[row][col];
        if (filter(cell, { row, col, pos })) {
          grid = gridReplaceCell(row, col, changeCell(cell, change), puzzle.symmetry)(grid);
        }
        pos++;
      }
    }
    return numberPuzzle({ ...puzzle, grid });
  };

export const changeCurrentCell =
  (change: Partial<XwdCell> | ((cell: XwdCell) => Partial<XwdCell>)) =>
  (puzzle: XwdPuzzle): XwdPuzzle => {
    const current = currentCell(puzzle);
    return changeCells(change)((cell) => cell === current)(puzzle);
  };

export const changeCellsInWord =
  (change: (cell: XwdCell) => Partial<XwdCell>) =>
  (puzzle: XwdPuzzle): XwdPuzzle => {
    const word = currentWord(puzzle);
    return changeCells(change)((_, { row, col }) => wordIncludes(row, col, word))(puzzle);
  };

export function advanceCursorInWord(puzzle: XwdPuzzle, findEmpty: boolean) {
  // move to next cell in word
  const { row, col } = puzzle.cursor;
  const word = currentWord(puzzle);
  if (!word) return puzzle;

  const currentIndex = word.findIndex(([i, j]) => i === row && j === col);
  let nextCellIdx = nextOrLast(word, currentIndex);

  // if we just filled an empty cell, skip to the next empty cell, with wrap around
  if (findEmpty) {
    const cellIsEmpty = ([i, j]: [number, number]) => !puzzle.grid[i][j].content;
    const nextEmptyCellIdx = wrapFindIndex(word, nextCellIdx, cellIsEmpty);
    if (nextEmptyCellIdx > -1) nextCellIdx = nextEmptyCellIdx;
  }

  const [i, j] = word[nextCellIdx];
  return {
    ...puzzle,
    cursor: { ...puzzle.cursor, row: i, col: j },
  };
}

export const applySymmetry = (puzzle: XwdPuzzle, symmetryType = puzzle.symmetry) =>
  symmetryType ? { ...puzzle, grid: enforceSymmetry(puzzle.grid, symmetryType) } : puzzle;

export const setSymmetry = (symmetryType: XwdSymmetry) => (puzzle: XwdPuzzle) =>
  numberPuzzle(applySymmetry({ ...puzzle, symmetry: symmetryType }));

export const setAutonumber = (value: XwdNumbering) => (p: XwdPuzzle) =>
  numberPuzzle({
    ...p,
    autonumber: value,
  });

/* related */
// TODO normalize direction constants
export const getRelatedClues = (puzzle: XwdPuzzle): XwdWordLoc[] =>
  parseRelatedClues(currentClue(puzzle)?.text || '').map(
    (loc: { number: string; direction: [number, number] }) => ({
      number: loc.number,
      direction: loc.direction === ACROSS ? 'across' : 'down',
    })
  );

export const relatedCells = (puzzle: XwdPuzzle): XwdLoc[] =>
  getRelatedClues(puzzle)
    .map((locator) => getCellsInWord(puzzle.grid, locator))
    .flat();
