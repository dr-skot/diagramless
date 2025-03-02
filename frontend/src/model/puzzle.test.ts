import { puzzleData as plainData } from '../../tests/assets/plain-Jun2521.data';
import { puzzleData as dataWithNote } from '../../tests/assets/note-Jul0121.data';
import { puzzleData as dataWithCircles } from '../../tests/assets/circles-Jun2221.data';
import { changeCurrentCell, puzzleFromData, setSymmetry } from './puzzle';
import { currentCell } from './cursor';
import { emptyCell } from './cell';

// overrule ts objections
const getPuzzle = (data: any) => puzzleFromData(data)!;

describe('puzzleFromData', () => {
  it('reads width & height', () => {
    const puzzle = getPuzzle(plainData);
    expect(puzzle.width).toBe(15);
    expect(puzzle.height).toBe(15);
  });
  it('reads author, title, copyright', () => {
    const puzzle = getPuzzle(plainData);
    expect(puzzle.author).toBe('Scott Earl / Will Shortz');
    expect(puzzle.title).toBe('NY Times, Friday, June 25, 2021 ');
    expect(puzzle.copyright).toBe('© 2021, The New York Times');
    expect(puzzle.note).toBe('');
  });
  it('reads clues', () => {
    const puzzle = getPuzzle(plainData);
    expect(puzzle.clues[0].number).toBe('1');
    expect(puzzle.clues[0].direction).toBe('across');
    expect(puzzle.clues[0].text).toBe('Presses (down)');
  });
  it('reads note', () => {
    const puzzle = getPuzzle(dataWithNote);
    expect(puzzle.note).toMatch(/^In the print version of this puzzle,/);
  });
  it('reads circles', () => {
    const puzzle = getPuzzle(dataWithCircles);
    expect(dataWithCircles.width).toBe(15);
    expect(dataWithCircles.extras.GEXT[48]).toBe(128);
    expect(dataWithCircles.extras.GEXT[45]).toBe(0);
    expect(puzzle.grid[3][3].solution.circle).toBe(true);
    expect(puzzle.grid[3][0].solution.circle).toBe(false);
  });
});

describe('changeCurrentCell', () => {
  it('gives access to the current cell', () => {
    const puzzle = getPuzzle(plainData);
    const callback = jest.fn();
    changeCurrentCell(callback)(puzzle);
    expect(callback).toHaveBeenCalledWith(currentCell(puzzle));
  });
  it('changes the current cell', () => {
    const puzzle = getPuzzle(plainData);
    const cell = { ...emptyCell(), content: '%' };
    const callback = jest.fn(() => cell);
    expect(currentCell(puzzle).content).not.toEqual('%');
    const newPuzzle = changeCurrentCell(callback)(puzzle);
    expect(currentCell(newPuzzle).content).toEqual('%');
  });
  it('takes a callback function', () => {
    // @ts-ignore
    let puzzle = changeCurrentCell(() => ({ content: '%' }))(getPuzzle(plainData));
    expect(currentCell(puzzle).content).toBe('%');
  });
  it('takes a partial XwdCell', () => {
    // @ts-ignore
    let puzzle = changeCurrentCell({ content: '%' })(getPuzzle(plainData));
    expect(currentCell(puzzle).content).toBe('%');
  });
});

describe('when symmetry is set', () => {
  it('sets a sister cell black', () => {
    // @ts-ignore
    let puzzle = setSymmetry('diagonal')(getPuzzle(plainData));
    expect(puzzle.width).toBe(15);
    expect(puzzle.grid[0][0].isBlack).toBeFalsy();
    expect(puzzle.grid[14][14].isBlack).toBeFalsy();
    puzzle = changeCurrentCell({ isBlack: true })(puzzle);
    expect(puzzle.grid[0][0].isBlack).toBeTruthy();
    expect(puzzle.grid[14][14].isBlack).toBeTruthy();
  });
  it('sets a sister cell white again', () => {
    // @ts-ignore
    let puzzle = setSymmetry('diagonal')(getPuzzle(plainData));
    expect(puzzle.width).toBe(15);
    puzzle = changeCurrentCell({ isBlack: true })(puzzle);
    puzzle = changeCurrentCell({ isBlack: false })(puzzle);
    expect(puzzle.grid[0][0].isBlack).toBeFalsy();
    expect(puzzle.grid[14][14].isBlack).toBeFalsy();
  });
});
