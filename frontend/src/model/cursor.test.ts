import { emptyCell } from './cell';
import { XwdGrid } from './grid';
import { XwdPuzzle } from './puzzle';
import {
  currentCell,
  currentWord,
  crossingWord,
  wordContains,
  setCursor,
  toggleDirection,
  setPosition,
  addToCursor,
  clueNumber,
  goToWord,
  goToNextWord,
  cursorShadowFallsOn,
} from './cursor';

// 3x3 grid:
//  1A  2B  3C
//  .   4D  5E
//  6F  7G  8H
// Across words: ABC (1-across), DE (4-across), FGH (6-across)
// Down words: AF (1-down), BDG (2-down), CEH (3-down)
const makeGrid = (): XwdGrid => {
  const cell = (content: string, number = '', isBlack = false) => ({
    ...emptyCell({ content, isBlack, number }),
    content,
    isBlack,
    number,
  });
  return [
    [cell('A', '1'), cell('B', '2'), cell('C', '3')],
    [cell('', '', true), cell('D', '4'), cell('E', '5')],
    [cell('F', '6'), cell('G', '7'), cell('H', '8')],
  ];
};

const makePuzzle = (
  row = 0, col = 0, direction: 'across' | 'down' = 'across'
): XwdPuzzle => ({
  width: 3,
  height: 3,
  grid: makeGrid(),
  cursor: { row, col, direction },
  clues: [
    { number: '1', direction: 'across', text: '1-across clue' },
    { number: '4', direction: 'across', text: '4-across clue' },
    { number: '6', direction: 'across', text: '6-across clue' },
    { number: '1', direction: 'down', text: '1-down clue' },
    { number: '2', direction: 'down', text: '2-down clue' },
    { number: '3', direction: 'down', text: '3-down clue' },
  ],
  time: 0,
  symmetry: null,
  autonumber: 'off',
  title: '',
  author: '',
  copyright: '',
  note: '',
  date: '',
});

describe('currentCell', () => {
  it('returns cell at cursor position', () => {
    expect(currentCell(makePuzzle(0, 1)).content).toBe('B');
    expect(currentCell(makePuzzle(2, 2)).content).toBe('H');
  });
});

describe('currentWord', () => {
  it('returns across word at cursor', () => {
    const word = currentWord(makePuzzle(0, 1, 'across'));
    expect(word).toEqual([[0, 0], [0, 1], [0, 2]]);
  });
  it('returns down word at cursor', () => {
    const word = currentWord(makePuzzle(0, 1, 'down'));
    expect(word).toEqual([[0, 1], [1, 1], [2, 1]]);
  });
});

describe('crossingWord', () => {
  it('returns perpendicular word', () => {
    const word = crossingWord(makePuzzle(0, 1, 'across'));
    expect(word).toEqual([[0, 1], [1, 1], [2, 1]]);
  });
});

describe('wordContains', () => {
  it('true for cells in current word', () => {
    const puzzle = makePuzzle(0, 0, 'across');
    expect(wordContains(puzzle, 0, 0)).toBe(true);
    expect(wordContains(puzzle, 0, 2)).toBe(true);
  });
  it('false for cells not in current word', () => {
    const puzzle = makePuzzle(0, 0, 'across');
    expect(wordContains(puzzle, 1, 1)).toBe(false);
  });
});

describe('setCursor', () => {
  it('sets row and col', () => {
    const cursor = { row: 0, col: 0, direction: 'across' as const };
    expect(setCursor(cursor, 2, 1)).toEqual({ row: 2, col: 1, direction: 'across' });
  });
});

describe('toggleDirection', () => {
  it('flips across to down', () => {
    expect(toggleDirection({ row: 0, col: 0, direction: 'across' }).direction).toBe('down');
  });
  it('flips down to across', () => {
    expect(toggleDirection({ row: 0, col: 0, direction: 'down' }).direction).toBe('across');
  });
});

describe('setPosition', () => {
  it('converts flat index to row/col', () => {
    const puzzle = makePuzzle();
    const result = setPosition(puzzle, 7); // row 2, col 1 in 3-wide grid
    expect(result.cursor.row).toBe(2);
    expect(result.cursor.col).toBe(1);
  });
});

describe('addToCursor', () => {
  it('moves cursor by offset', () => {
    const result = addToCursor(makePuzzle(1, 1), 1, 0);
    expect(result.cursor.row).toBe(2);
    expect(result.cursor.col).toBe(1);
  });
  it('wraps at grid edges', () => {
    const result = addToCursor(makePuzzle(2, 2), 1, 0);
    expect(result.cursor.row).toBe(0);
  });
});

describe('clueNumber', () => {
  it('returns clue number for current direction', () => {
    const puzzle = makePuzzle(0, 0, 'across');
    expect(clueNumber(puzzle, 'across')).toBe('1');
  });
  it('returns clue number for crossing direction', () => {
    const puzzle = makePuzzle(0, 1, 'across');
    expect(clueNumber(puzzle, 'down')).toBe('2');
  });
});

describe('goToWord', () => {
  it('moves cursor to cell with given number', () => {
    const result = goToWord('6', 'across')(makePuzzle());
    expect(result.cursor).toEqual({ row: 2, col: 0, direction: 'across' });
  });
  it('returns unchanged puzzle if number not found', () => {
    const puzzle = makePuzzle();
    expect(goToWord('99', 'across')(puzzle)).toBe(puzzle);
  });
});

describe('goToNextWord', () => {
  it('moves to next word start in same direction', () => {
    // cursor at 1-across (0,0), next across word starts at (1,1) = 4-across
    const result = goToNextWord(makePuzzle(0, 0, 'across'));
    expect(result.cursor.row).toBe(1);
    expect(result.cursor.col).toBe(1);
    expect(result.cursor.direction).toBe('across');
  });

  it('moves backward to previous word', () => {
    // cursor at 6-across (2,0), previous across word is 4-across (1,1)
    const result = goToNextWord(makePuzzle(2, 0, 'across'), { backward: true });
    expect(result.cursor.row).toBe(1);
    expect(result.cursor.col).toBe(1);
  });

  it('wraps around and flips direction at puzzle boundary', () => {
    // cursor at 6-across (2,0), going forward should wrap to 1-down
    const result = goToNextWord(makePuzzle(2, 0, 'across'));
    expect(result.cursor.direction).toBe('down');
  });

  it('lands on first empty cell in target word', () => {
    // Make a puzzle where 4-across has D filled but E empty
    const puzzle = makePuzzle(0, 0, 'across');
    puzzle.grid[1][1] = { ...puzzle.grid[1][1], content: 'D' };
    puzzle.grid[1][2] = { ...puzzle.grid[1][2], content: '' };
    const result = goToNextWord(puzzle);
    // Should land on (1,2) — the empty cell — not (1,1) the word start
    expect(result.cursor.row).toBe(1);
    expect(result.cursor.col).toBe(2);
  });

  it('skipFilled skips words with no empty cells', () => {
    // Fill 4-across entirely, leave 6-across empty
    const puzzle = makePuzzle(0, 0, 'across');
    puzzle.grid[1][1] = { ...puzzle.grid[1][1], content: 'D' };
    puzzle.grid[1][2] = { ...puzzle.grid[1][2], content: 'E' };
    puzzle.grid[2][0] = { ...puzzle.grid[2][0], content: '' };
    const result = goToNextWord(puzzle, { skipFilled: true });
    // Should skip 4-across (filled) and land on 6-across
    expect(result.cursor.row).toBe(2);
    expect(result.cursor.col).toBe(0);
  });
});

describe('cursorShadowFallsOn', () => {
  it('across: matches same row', () => {
    const cursor = { row: 1, col: 2, direction: 'across' as const };
    expect(cursorShadowFallsOn(cursor, 1, 0)).toBe(true);
    expect(cursorShadowFallsOn(cursor, 0, 2)).toBe(false);
  });
  it('down: matches same column', () => {
    const cursor = { row: 1, col: 2, direction: 'down' as const };
    expect(cursorShadowFallsOn(cursor, 0, 2)).toBe(true);
    expect(cursorShadowFallsOn(cursor, 1, 0)).toBe(false);
  });
});
