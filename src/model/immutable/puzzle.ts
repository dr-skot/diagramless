import { findCell, mapCells, newGrid, XwdDirection, XwdGrid } from './grid';
import { currentWord, XwdCursor } from './cursor';
import { XwdSymmetry } from './symmetry';
import { ACROSS, parseRelatedClues, puzzleFromFileData } from '../../services/xwdService';
import { getCellsInWord, wordNumber } from './word';

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
