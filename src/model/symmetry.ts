import { gridHeight, gridWidth, mapCells, XwdGrid } from './grid';

export type XwdSymmetry = 'diagonal' | 'left-right' | null;

export const getSisterCell = (grid: XwdGrid, row: number, col: number, symmetry: XwdSymmetry) => {
  if (!symmetry) return null;
  const height = gridHeight(grid),
    width = gridWidth(grid);
  switch (symmetry) {
    case 'diagonal':
      return grid[height - row - 1][width - col - 1];
    case 'left-right':
      return grid[row][width - col - 1];
    default:
      return null;
  }
};

export const enforceSymmetry = (grid: XwdGrid, symmetryType: XwdSymmetry) =>
  mapCells((cell, { row, col }) =>
    // ignore cells set black by enforce symmetry by requiring true not truthy
    !cell.isBlack && getSisterCell(grid, row, col, symmetryType)?.isBlack === true
      ? { ...cell, isBlack: symmetryType }
      : cell
  )(grid);

export const undoSymmetry = (grid: XwdGrid, symmetryType: XwdSymmetry) =>
  mapCells((cell) => (cell.isBlack === symmetryType ? { ...cell, isBlack: false } : cell))(grid);
