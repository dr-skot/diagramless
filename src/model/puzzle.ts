import { findCell, mapCells, newGrid, XwdDirection, XwdGrid } from './grid';
import { currentCell, currentWord, XwdCursor } from './cursor';
import { enforceSymmetry, getSisterCell, XwdSymmetry } from './symmetry';
import { ACROSS, parseRelatedClues, puzzleFromFileData } from '../services/xwdService';
import { getCellsInWord, numberWordStarts, wordNumber } from './word';
import { XwdCell } from './cell';
import { arraySet, nextOrLast, wrapFindIndex } from '../services/common/utils';

export interface XwdClue {
  number: string;
  direction: XwdDirection;
  text: string;
}

export interface XwdWordLoc {
  number: string;
  direction: XwdDirection;
}

export interface XwdData {
  title?: string;
  author?: string;
}

export interface XwdPuzzle {
  width: number;
  height: number;
  grid: XwdGrid;
  cursor: XwdCursor;
  clues: XwdClue[];
  time: number;
  symmetry: XwdSymmetry;
  isAutonumbered: boolean;
  title: string;
  author: string;
  copyright: string;
  note: string;
}

const emptyPuzzle: XwdPuzzle = {
  width: 0,
  height: 0,
  grid: newGrid(0, 0),
  cursor: { row: 0, col: 0, direction: 'across' },
  time: 0,
  clues: [],
  symmetry: null,
  isAutonumbered: false,
  title: '',
  author: '',
  copyright: '',
  note: '',
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
  };
};

export const currentClue = (puzzle: XwdPuzzle, direction = puzzle.cursor.direction) => {
  const word = currentWord(puzzle);
  const number = wordNumber(puzzle.grid, word);
  if (!number) return null;
  return puzzle.clues.find((clue) => clue.number === number && clue.direction === direction);
};

// TODO normalize direction constants
export const relatedClues = (puzzle: XwdPuzzle): XwdWordLoc =>
  parseRelatedClues(currentClue(puzzle)?.text || '').map(
    (loc: { number: string; direction: [number, number] }) => ({
      number: loc.number,
      direction: loc.direction === ACROSS ? 'across' : 'down',
    })
  );

export const wordCells = (grid: XwdGrid, locations: XwdWordLoc[]) => {
  locations.map((loc) => getCellsInWord(grid, loc)).flat();
};

export const currentSisterCell = ({ grid, cursor, symmetry }: XwdPuzzle) =>
  getSisterCell(grid, cursor.row, cursor.col, symmetry);

export const changeCurrentCell =
  (change: Partial<XwdCell> | ((cell: XwdCell) => Partial<XwdCell>)) =>
  (puzzle: XwdPuzzle): XwdPuzzle => {
    const oldCell = currentCell(puzzle);
    const changes = typeof change === 'function' ? change(oldCell) : change;
    if (changes === oldCell) return puzzle;
    const newCell = { ...oldCell, ...changes };
    const [i, j] = [puzzle.cursor.row, puzzle.cursor.col];
    let newPuzzle = {
      ...puzzle,
      grid: arraySet(i, arraySet(j, newCell)(puzzle.grid[i]))(puzzle.grid),
    };
    if (newCell.isBlack !== oldCell.isBlack && puzzle.symmetry) {
      if (puzzle.symmetry) {
        const sister = currentSisterCell(newPuzzle);
        if (sister && !!sister.isBlack !== !!newCell.isBlack) {
          newPuzzle = {
            ...newPuzzle,
            grid: mapCells((c) =>
              c === sister ? { ...c, isBlack: newCell.isBlack && puzzle.symmetry } : c
            )(newPuzzle.grid),
          };
        }
      }
      newPuzzle = applyAutonumbering(newPuzzle);
    }
    return newPuzzle;
  };

export const changeCellsInWord =
  (change: (cell: XwdCell) => Partial<XwdCell>) =>
  (puzzle: XwdPuzzle): XwdPuzzle => {
    const word = currentWord(puzzle);
    if (!word?.length) return puzzle;
    return {
      ...puzzle,
      grid: mapCells((cell, { row, col }) =>
        word.some(([i, j]) => i === row && j === col) ? change(cell) : cell
      )(puzzle.grid),
    };
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

export const applyAutonumbering = (puzzle: XwdPuzzle) =>
  puzzle.isAutonumbered ? autonumber(puzzle) : puzzle;

export const setSymmetry = (symmetryType: XwdSymmetry) => (puzzle: XwdPuzzle) =>
  applySymmetry({ ...puzzle, symmetry: symmetryType });

export const toggleAutonumbering = (puzzle: XwdPuzzle) =>
  applyAutonumbering({ ...puzzle, isAutonumbered: !puzzle.isAutonumbered });

export const autonumber = (puzzle: XwdPuzzle) => ({
  ...puzzle,
  grid: numberWordStarts(puzzle.grid),
});
