import { XwdSymmetry } from './symmetry';

export interface XwdCellSolution {
  isBlack: boolean;
  content: string;
  number: string;
  circle?: boolean;
}

export interface XwdCell {
  solution: XwdCellSolution;
  isBlack: boolean | XwdSymmetry;
  content: string;
  number: string;
  circle: boolean;
  isMarkedWrong: boolean;
  wasRevealed: boolean;
  isLocked: boolean;
}

const blankSolution = {
  isBlack: false,
  content: '',
  number: '',
  circle: false,
};

export const emptyCell = (solution: Partial<XwdCellSolution> = {}): XwdCell => ({
  solution: { ...blankSolution, ...solution },
  isBlack: false,
  content: '',
  number: '',
  circle: false,
  isMarkedWrong: false,
  wasRevealed: false,
  isLocked: false,
});

export const setContent = (cell: XwdCell, content: string) =>
  cell.isLocked
    ? cell
    : {
        ...cell,
        content,
        isBlack: false,
        isMarkedWrong: false,
        wasRevealed: false,
      };

export const toggleBlack = (cell: XwdCell) =>
  cell.isLocked
    ? cell
    : {
        ...cell,
        isBlack: !cell.isBlack,
        isMarkedWrong: false,
        wasRevealed: false,
      };

// Checking and revealing

export const cellIsCorrect = (cell: XwdCell) =>
  blackIsCorrect(cell) && (cell.isBlack || contentIsCorrect(cell));

export const blackIsCorrect = (cell: XwdCell) => !!cell.isBlack === !!cell.solution.isBlack;

export const contentIsCorrect = (cell: XwdCell) => cell.content === cell.solution.content;

export const cellIsEmpty = (cell: XwdCell) => !cell.isBlack && !cell.content;

export const checkCell = (cell: XwdCell) =>
  cellIsEmpty(cell)
    ? cell
    : { ...cell, isMarkedWrong: !cellIsCorrect(cell), isLocked: cellIsCorrect(cell) };

export const revealCell = (cell: XwdCell) =>
  cellIsCorrect(cell)
    ? { ...cell, wasChecked: true, isLocked: true }
    : {
        ...cell,
        isBlack: cell.solution.isBlack,
        content: cell.solution.content,
        wasRevealed: true,
        isLocked: true,
      };

export const clearCell = (cell: XwdCell, options: { number?: boolean } = {}) => ({
  ...emptyCell(cell.solution),
  number: options.number ? '' : cell.number,
});

export const exposeNumber = (cell: XwdCell) => ({
  ...cell,
  number: cell.solution.number,
});

export const revealMeta = (cell: XwdCell) => ({
  ...cell,
  isBlack: cell.solution.isBlack,
  number: cell.solution.number,
  circle: cell.solution.circle,
});

export const revealCircle = (cell: XwdCell) => ({
  ...cell,
  circle: cell.solution.circle,
});
