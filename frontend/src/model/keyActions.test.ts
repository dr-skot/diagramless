import { emptyCell } from './cell';
import { XwdGrid } from './grid';
import { XwdPuzzle } from './puzzle';
import { LEFT, RIGHT, UP, DOWN, Vector } from './navigation';
import {
  handleArrow,
  handleTab,
  handleBackspace,
  handleAlpha,
  handlePeriod,
  handleDigit,
} from './keyActions';

// 3x3 grid:
//  1A  2B  3C
//  .   4D  5E
//  6F  7G  8H
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
  clues: [],
  time: 0,
  symmetry: null,
  autonumber: 'off',
  title: '',
  author: '',
  copyright: '',
  note: '',
  date: '',
});

// Empty puzzle for testing input actions
const makeEmptyPuzzle = (
  row = 0, col = 0, direction: 'across' | 'down' = 'across'
): XwdPuzzle => {
  const cell = (number = '') => ({
    ...emptyCell({ content: '', number }),
    content: '',
    number,
  });
  return {
    width: 3,
    height: 3,
    grid: [
      [cell('1'), cell('2'), cell('3')],
      [cell(), cell('4'), cell('5')],
      [cell('6'), cell('7'), cell('8')],
    ],
    cursor: { row, col, direction },
    clues: [],
    time: 0,
    symmetry: null,
    autonumber: 'off',
    title: '',
    author: '',
    copyright: '',
    note: '',
    date: '',
  };
};

describe('handleArrow', () => {
  it('moves cursor in same direction', () => {
    const result = handleArrow(RIGHT)(makePuzzle(0, 0, 'across'));
    expect(result.cursor.col).toBe(1);
    expect(result.cursor.direction).toBe('across');
  });

  it('toggles direction if perpendicular', () => {
    const result = handleArrow(DOWN)(makePuzzle(0, 0, 'across'));
    expect(result.cursor.direction).toBe('down');
    // cursor position unchanged
    expect(result.cursor.row).toBe(0);
    expect(result.cursor.col).toBe(0);
  });
});

describe('handleTab', () => {
  it('moves to next word', () => {
    const result = handleTab({ backward: false })(makePuzzle(0, 0, 'across'));
    // next across word starts at (1,1)
    expect(result.cursor.row).toBe(1);
    expect(result.cursor.col).toBe(1);
  });

  it('moves backward with backward option', () => {
    const result = handleTab({ backward: true })(makePuzzle(2, 0, 'across'));
    expect(result.cursor.row).toBe(1);
    expect(result.cursor.col).toBe(1);
  });
});

describe('handleBackspace', () => {
  it('clears content from a filled cell', () => {
    const puzzle = makePuzzle(0, 0, 'across'); // cell has content 'A'
    const result = handleBackspace(false)(puzzle);
    expect(result.grid[0][0].content).toBe('');
  });

  it('moves cursor backward on empty non-black cell', () => {
    const puzzle = makeEmptyPuzzle(0, 1, 'across'); // empty cell
    const result = handleBackspace(false)(puzzle);
    expect(result.cursor.col).toBe(0);
  });

  it('returns unchanged puzzle on locked cell', () => {
    const puzzle = makePuzzle(0, 0, 'across');
    puzzle.grid[0][0] = { ...puzzle.grid[0][0], isLocked: true };
    const result = handleBackspace(false)(puzzle);
    expect(result).toBe(puzzle);
  });

  it('trims cell number when editing number', () => {
    const puzzle = makeEmptyPuzzle(0, 0, 'across');
    puzzle.grid[0][0] = { ...puzzle.grid[0][0], number: '12' };
    const result = handleBackspace(true)(puzzle);
    expect(result.grid[0][0].number).toBe('1');
  });
});

describe('handleAlpha', () => {
  it('sets content and advances cursor', () => {
    const puzzle = makeEmptyPuzzle(0, 0, 'across');
    const result = handleAlpha('A')(puzzle);
    expect(result.grid[0][0].content).toBe('A');
    // cursor advanced
    expect(result.cursor.col).toBe(1);
  });

  it('returns unchanged puzzle on locked cell', () => {
    const puzzle = makeEmptyPuzzle(0, 0, 'across');
    puzzle.grid[0][0] = { ...puzzle.grid[0][0], isLocked: true };
    const result = handleAlpha('A')(puzzle);
    expect(result).toBe(puzzle);
  });
});

describe('handlePeriod', () => {
  it('toggles black and advances cursor', () => {
    const puzzle = makeEmptyPuzzle(0, 0, 'across');
    const result = handlePeriod(puzzle);
    expect(result.grid[0][0].isBlack).toBe(true);
    expect(result.cursor.col).toBe(1);
  });
});

describe('handleDigit', () => {
  it('sets cell number', () => {
    const puzzle = makeEmptyPuzzle(0, 0, 'across');
    const result = handleDigit('5', false)(puzzle);
    expect(result.grid[0][0].number).toBe('5');
  });

  it('appends digit when continuing edit', () => {
    const puzzle = makeEmptyPuzzle(0, 0, 'across');
    puzzle.grid[0][0] = { ...puzzle.grid[0][0], number: '1' };
    const result = handleDigit('2', true)(puzzle);
    expect(result.grid[0][0].number).toBe('12');
  });

  it('starts fresh when not continuing edit', () => {
    const puzzle = makeEmptyPuzzle(0, 0, 'across');
    puzzle.grid[0][0] = { ...puzzle.grid[0][0], number: '1' };
    const result = handleDigit('5', false)(puzzle);
    expect(result.grid[0][0].number).toBe('5');
  });

  it('digit 0 clears number', () => {
    const puzzle = makeEmptyPuzzle(0, 0, 'across');
    const result = handleDigit('0', false)(puzzle);
    expect(result.grid[0][0].number).toBe('');
  });

  it('returns unchanged if autonumber is on', () => {
    const puzzle = { ...makeEmptyPuzzle(0, 0, 'across'), autonumber: 'from both ends' as const };
    const result = handleDigit('5', false)(puzzle);
    expect(result).toBe(puzzle);
  });

  it('returns unchanged if cell is locked', () => {
    const puzzle = makeEmptyPuzzle(0, 0, 'across');
    puzzle.grid[0][0] = { ...puzzle.grid[0][0], isLocked: true };
    const result = handleDigit('5', false)(puzzle);
    expect(result).toBe(puzzle);
  });
});
