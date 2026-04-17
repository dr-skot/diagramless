import { advanceCursorInWord, changeCurrentCell, XwdPuzzle } from './puzzle';
import { addToCursor, currentCell, goToNextWord, toggleDirection } from './cursor';
import { setContent, toggleBlack } from './cell';
import { backVectorFor, isPerpendicular, vectorFor, Vector } from './navigation';

export const handleArrow = (vector: Vector) => (puzzle: XwdPuzzle): XwdPuzzle =>
  isPerpendicular(puzzle.cursor.direction, vector)
    ? { ...puzzle, cursor: toggleDirection(puzzle.cursor) }
    : addToCursor(puzzle, vector[0], vector[1]);

export const handleTab = (options: { backward: boolean }) => (puzzle: XwdPuzzle): XwdPuzzle =>
  goToNextWord(puzzle, { backward: options.backward, skipFilled: true });

export const handleBackspace = (wasEditingNumber: boolean) => (puzzle: XwdPuzzle): XwdPuzzle => {
  const cell = currentCell(puzzle);
  if (wasEditingNumber) {
    return changeCurrentCell((c) => ({ number: c.number.slice(0, -1) }))(puzzle);
  } else if (cell.content && !cell.isBlack && !cell.isLocked) {
    return changeCurrentCell(() => ({ content: '' }))(puzzle);
  } else if (cell.isLocked) {
    return puzzle;
  } else {
    return addToCursor(puzzle, ...backVectorFor(puzzle.cursor.direction));
  }
};

export const handleAlpha = (content: string) => (puzzle: XwdPuzzle): XwdPuzzle => {
  const cell = currentCell(puzzle);
  if (cell.isLocked) return puzzle;
  return advanceCursorInWord(
    changeCurrentCell((c) => setContent(c, content))(puzzle),
    !cell.content
  );
};

export const handlePeriod = (puzzle: XwdPuzzle): XwdPuzzle =>
  addToCursor(
    changeCurrentCell(toggleBlack)(puzzle),
    ...vectorFor(puzzle.cursor.direction)
  );

function editNumber(number: string, digit: string, wasEditing: boolean) {
  const newNumber = (wasEditing ? number : '') + digit;
  return newNumber === '0' ? '' : newNumber;
}

export const handleDigit = (digit: string, wasEditingNumber: boolean) => (puzzle: XwdPuzzle): XwdPuzzle => {
  const cell = currentCell(puzzle);
  if (puzzle.autonumber !== 'off' || cell.isLocked) return puzzle;
  return changeCurrentCell({
    isBlack: false,
    number: editNumber(cell.number, digit, wasEditingNumber),
  })(puzzle);
};
