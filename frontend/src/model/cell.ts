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

export const setContent = (cell: XwdCell, content: string) => {
  console.log('setContent called with cell:', JSON.stringify(cell), 'content:', content);
  if (cell.isLocked) {
    console.log('Cell is locked, not setting content');
    return cell;
  }
  
  const result = {
    ...cell,
    content,
    isBlack: false,
    isMarkedWrong: false,
    wasRevealed: false,
  };
  console.log('setContent result:', JSON.stringify(result));
  return result;
};

export const toggleBlack = (cell: XwdCell) => {
  console.log('toggleBlack called with cell:', JSON.stringify(cell));
  if (cell.isLocked) {
    console.log('Cell is locked, not toggling');
    return cell;
  }
  
  const result = {
    ...cell,
    isBlack: !cell.isBlack,
    number: !cell.isBlack ? '' : cell.number,
    isMarkedWrong: false,
    wasRevealed: false,
  };
  console.log('toggleBlack result:', JSON.stringify(result));
  return result;
};

// Checking and revealing

export const cellIsCorrect = (cell: XwdCell): boolean =>
  blackIsCorrect(cell) && (!!cell.isBlack || contentIsCorrect(cell));

export const blackIsCorrect = (cell: XwdCell) => !!cell.isBlack === cell.solution.isBlack;

export const contentIsCorrect = (cell: XwdCell) => cell.content === cell.solution.content;

export const cellIsEmpty = (cell: XwdCell) => !cell.isBlack && !cell.content;

export const checkCell = (cell: XwdCell): XwdCell =>
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
