import { puzzleData as plainData } from '../../tests/assets/Jun2521.data';
import { puzzleData as dataWithNote } from '../../tests/assets/note-Jul0121.data';
import { puzzleData as dataWithCircles } from '../../tests/assets/circles-Jun2221.data';
import { changeCurrentCell, puzzleFromData } from './puzzle';
import { currentCell } from './cursor';
import { emptyCell } from './cell';

describe('puzzleFromData', () => {
  it('reads width & height', () => {
    const puzzle = puzzleFromData(plainData);
    expect(puzzle.width).toBe(15);
    expect(puzzle.height).toBe(15);
  });
  it('reads author, title, copyright', () => {
    const puzzle = puzzleFromData(plainData);
    expect(puzzle.author).toBe('Scott Earl / Will Shortz');
    expect(puzzle.title).toBe('NY Times, Friday, June 25, 2021 ');
    expect(puzzle.copyright).toBe('© 2021, The New York Times');
    expect(puzzle.note).toBe('');
  });
  it('reads clues', () => {
    const puzzle = puzzleFromData(plainData);
    expect(puzzle.clues[0].number).toBe('1');
    expect(puzzle.clues[0].direction).toBe('across');
    expect(puzzle.clues[0].text).toBe('Presses (down)');
    console.log(JSON.stringify(puzzle));
  });
  it('reads note', () => {
    const puzzle = puzzleFromData(dataWithNote);
    expect(puzzle.note).toMatch(/^In the print version of this puzzle,/);
  });
  it('reads circles', () => {
    const puzzle = puzzleFromData(dataWithCircles);
    expect(dataWithCircles.width).toBe(15);
    expect(dataWithCircles.extras.GEXT[48]).toBe(128);
    expect(dataWithCircles.extras.GEXT[45]).toBe(0);
    expect(puzzle.grid[3][3].solution.circle).toBe(true);
    expect(puzzle.grid[3][0].solution.circle).toBe(false);
  });
});

describe('changeCurrentCell', () => {
  it('gives access to the current cell', () => {
    const puzzle = puzzleFromData(plainData);
    const callback = jest.fn();
    changeCurrentCell(callback)(puzzle);
    expect(callback).toHaveBeenCalledWith(currentCell(puzzle));
  });
  it('changes the current cell', () => {
    const puzzle = puzzleFromData(plainData);
    const cell = { ...emptyCell(), content: '%' };
    const callback = jest.fn(() => cell);
    expect(currentCell(puzzle)).not.toBe(cell);
    const newPuzzle = changeCurrentCell(callback)(puzzle);
    expect(currentCell(newPuzzle)).toBe(cell);
  });
});
