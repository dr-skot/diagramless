import { newGrid, setContents } from './grid';
import { countWordStarts, numberPuzzle, numberWordStarts } from './numbering';
import { emptyPuzzle } from './puzzle';

describe('numberWordStarts', () => {
  it('can number the whole grid', () => {
    const data = 'abc:defghi:jkl'.split('');
    let xwd = setContents(data)(newGrid(2, 7));
    xwd = numberWordStarts(xwd);
    const numbers = xwd
      .flat()
      .map((cell) => cell.number)
      .join(',');
    expect(numbers).toBe('1,2,3,,4,5,6,7,,,,8,,');
  });
  it('can use custom nubmers', () => {
    const data = 'abc:defghi:jkl'.split('');
    let xwd = setContents(data)(newGrid(2, 7));
    xwd = numberWordStarts(xwd, [11, 12, 13, 14, 15, 16, 17, 18]);
    const numbers = xwd
      .flat()
      .map((cell) => cell.number)
      .join(',');
    expect(numbers).toBe('11,12,13,,14,15,16,17,,,,18,,');
  });
  it('leaves blanks if we run out of numbers', () => {
    const data = 'abc:defghi:jkl'.split('');
    let xwd = setContents(data)(newGrid(2, 7));
    xwd = numberWordStarts(xwd, [21, 22, 23, 24, 25]);
    const numbers = xwd
      .flat()
      .map((cell) => cell.number)
      .join(',');
    expect(numbers).toBe('21,22,23,,24,25,,,,,,,,');
  });
});

describe('countWordStarts', () => {
  it('counts the word starts', () => {
    const data = 'abc:defghi:jkl'.split('');
    const xwd = setContents(data)(newGrid(2, 7));
    expect(countWordStarts(xwd)).toBe(8);
  });
});

describe('numberPuzzle', () => {
  it('numbers from top', () => {
    const data = 'abc:defghi:jkl'.split('');
    const grid = setContents(data)(newGrid(2, 7));
    let puzzle = { ...emptyPuzzle, grid, autonumber: 'from top' };
    puzzle = numberPuzzle(puzzle);
    const numbers = puzzle.grid
      .flat()
      .map((cell) => cell.number)
      .join(',');
    expect(numbers).toBe('1,2,3,,4,5,6,7,,,,8,,');
  });
  it('numbers from top', () => {
    const data = 'abc:defghi:jkl'.split('');
    const grid = setContents(data)(newGrid(2, 7));
    let puzzle = { ...emptyPuzzle, grid, autonumber: 'from bottom', clues: [{ number: '60' }] };
    puzzle = numberPuzzle(puzzle);
    const numbers = puzzle.grid
      .flat()
      .map((cell) => cell.number)
      .join(',');
    expect(numbers).toBe('53,54,55,,56,57,58,59,,,,60,,');
  });
  it('numbers from both ends', () => {
    const data = 'abc:defghi:jkl'.split('');
    const grid = setContents(data)(newGrid(2, 7));
    let puzzle = { ...emptyPuzzle, grid, autonumber: 'from both ends', clues: [{ number: '60' }] };
    puzzle = numberPuzzle(puzzle);
    const numbers = puzzle.grid
      .flat()
      .map((cell) => cell.number)
      .join(',');
    expect(numbers).toBe('1,2,3,,4,57,58,59,,,,60,,');
  });
  it('doesnt number if autonumber is off', () => {
    const data = 'abc:defghi:jkl'.split('');
    const grid = setContents(data)(newGrid(2, 7));
    let puzzle = { ...emptyPuzzle, grid, autonumber: 'off', clues: [{ number: '60' }] };
    puzzle = numberPuzzle(puzzle);
    const numbers = puzzle.grid
      .flat()
      .map((cell) => cell.number)
      .join(',');
    expect(numbers).toBe(',,,,,,,,,,,,,');
  });
});
