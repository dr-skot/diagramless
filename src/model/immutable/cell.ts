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
  wasChecked: boolean;
  wasRevealed: boolean;
}

const blankSolution = {
  isBlack: false,
  content: '',
  number: '',
  circle: false,
};

export const newCell = (solution: Partial<XwdCellSolution> = {}): XwdCell => ({
  solution: { ...blankSolution, ...solution },
  isBlack: false,
  content: '',
  number: '',
  wasChecked: false,
  wasRevealed: false,
  circle: false,
});

export const setContent = (cell: XwdCell, content: string) => ({
  ...cell,
  content,
  wasChecked: false,
});

export const toggleBlack = (cell: XwdCell) => ({
  ...cell,
  isBlack: !cell.isBlack,
  wasChecked: false,
});

// Checking and revealing

export const isCorrect = (cell: XwdCell) =>
  blackIsCorrect(cell) && (cell.isBlack || contentIsCorrect(cell));

export const blackIsCorrect = (cell: XwdCell) => cell.isBlack === cell.solution.isBlack;

export const contentIsCorrect = (cell: XwdCell) => cell.content === cell.solution.content;

export const isEmpty = (cell: XwdCell) => !cell.isBlack && !cell.content;

export const check = (cell: XwdCell) => (isEmpty(cell) ? cell : { ...cell, wasChecked: true });

export const reveal = (cell: XwdCell) =>
  isCorrect(cell)
    ? { ...cell, wasChecked: true }
    : {
        ...cell,
        isBlack: cell.solution.isBlack,
        content: cell.solution.content,
        wasRevealed: true,
      };

export const clear = (cell: XwdCell, options: { number?: boolean } = {}) => ({
  ...newCell(cell.solution),
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
