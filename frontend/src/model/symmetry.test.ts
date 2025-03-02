import { enforceSymmetry, getSisterCell, undoSymmetry } from './symmetry';
import { newGrid } from './grid';

describe('getSisterCell', () => {
  it('finds diagonal sister', () => {
    const grid = newGrid(10, 12);
    expect(getSisterCell(grid, 1, 2, 'diagonal')).toEqual(grid[8][9]);
  });
  it('finds left-right sister', () => {
    const grid = newGrid(10, 12);
    expect(getSisterCell(grid, 1, 2, 'left-right')).toEqual(grid[1][9]);
  });
  it('returns null if no symmetry', () => {
    const grid = newGrid(10, 12);
    expect(getSisterCell(grid, 1, 2, null)).toBeNull();
  });
});

describe('enforceSymmetry', () => {
  it('blackens a diagonal sister', () => {
    let grid = newGrid(10, 12);
    expect(grid[7][6].isBlack).toBeFalsy();
    grid[2][5].isBlack = true;
    grid = enforceSymmetry(grid, 'diagonal');
    expect(grid[7][6].isBlack).toBeTruthy();
  });
  it('blackens a left-right sister', () => {
    let grid = newGrid(10, 12);
    expect(grid[2][6].isBlack).toBeFalsy();
    grid[2][5].isBlack = true;
    grid = enforceSymmetry(grid, 'left-right');
    expect(grid[2][6].isBlack).toBeTruthy();
  });
});

describe('undoSymmetry', () => {
  it('unblackens a diagonal sister', () => {
    let grid = newGrid(10, 12);
    grid[2][5].isBlack = true;
    grid = enforceSymmetry(grid, 'diagonal');
    expect(grid[7][6].isBlack).toBeTruthy();
    grid = undoSymmetry(grid, 'diagonal');
    expect(grid[7][6].isBlack).toBeFalsy();
    expect(grid[2][5].isBlack).toBe(true);
  });
  it('unblackens a left-right sister', () => {
    let grid = newGrid(10, 12);
    grid[2][5].isBlack = true;
    grid = enforceSymmetry(grid, 'left-right');
    expect(grid[2][6].isBlack).toBeTruthy();
    grid = undoSymmetry(grid, 'left-right');
    expect(grid[2][6].isBlack).toBeFalsy();
    expect(grid[2][5].isBlack).toBe(true);
  });
});
