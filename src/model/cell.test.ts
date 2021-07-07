import {
  emptyCell,
  toggleBlack,
  cellIsCorrect,
  setContent,
  XwdCell,
  cellIsEmpty,
  checkCell,
  revealCell,
} from './cell';

it("doesn't start black", () => {
  expect(emptyCell().isBlack).toBe(false);
});

it('can be toggled black/not black', () => {
  let cell = emptyCell();
  cell = toggleBlack(cell);
  expect(cell.isBlack).toBe(true);
  cell = toggleBlack(cell);
  expect(cell.isBlack).toBe(false);
});

describe('setContent', () => {
  it('sets the cell content', () => {
    const cell = setContent(emptyCell(), 'yo');
    expect(cell.content).toBe('yo');
  });
  it('does nothing if cell is locked', () => {
    let cell = { ...emptyCell(), isLocked: true };
    cell = setContent(cell, 'yo');
    expect(cell.content).not.toBe('yo');
  });
});

describe('isCorrect', () => {
  it('detects correct blackness', () => {
    let cell = { ...emptyCell({ isBlack: true }), isBlack: true };
    expect(cellIsCorrect(cell)).toBe(true);
  });
  it('detects incorrect blackness', () => {
    let cell = { ...emptyCell(), isBlack: true };
    expect(cellIsCorrect(cell)).toBe(false);
  });
  it('ignores content for black cells', () => {
    let cell = {
      ...emptyCell({ isBlack: true, content: 'B', number: '' }),
      isBlack: true,
      content: 'A',
    };
    expect(cellIsCorrect(cell)).toBe(true);
  });
  it('rejects mismatched content for non-black cells', () => {
    const cell = { ...emptyCell({ content: 'B' }), content: 'A' };
    expect(cellIsCorrect(cell)).toBe(false);
  });
  it('likes matching content in non-black cells', () => {
    const cell = { ...emptyCell({ content: 'B' }), content: 'B' };
    expect(cellIsCorrect(cell)).toBe(true);
  });
});

describe('checkCell', () => {
  it('leaves an empty cell alone', () => {
    const cell = emptyCell();
    expect(checkCell(cell)).toBe(cell);
  });
  it('marks a wrong cell wrong and doesnt lock it', () => {
    let cell = emptyCell({ content: 'A' });
    cell = { ...cell, content: 'B' };
    cell = checkCell(cell);
    expect(cell.isMarkedWrong && !cell.isLocked).toBe(true);
  });
  it('marks a right cell right and locks it', () => {
    let cell = emptyCell({ content: 'A' });
    cell = { ...cell, content: 'A' };
    cell = checkCell(cell);
    expect(!cell.isMarkedWrong && cell.isLocked).toBe(true);
  });
});

describe('revealCell', () => {
  it('locks a right cell', () => {
    let cell = emptyCell({ content: 'A' });
    cell = { ...cell, content: 'A' };
    cell = revealCell(cell);
    expect(cell.isLocked && !cell.wasRevealed).toBe(true);
  });
  it('reveals a wrong cell and marks it revealed', () => {
    let cell = emptyCell({ content: 'A' });
    cell = { ...cell, content: 'B' };
    cell = revealCell(cell);
    expect(cell.content).toBe('A');
    expect(cell.wasRevealed && cell.isLocked).toBe(true);
  });
  it('reveals an empty cell and marks it revealed', () => {
    let cell = emptyCell({ content: 'A' });
    cell = revealCell(cell);
    expect(cell.content).toBe('A');
    expect(cell.wasRevealed && cell.isLocked).toBe(true);
  });
  it('reveals an black cell', () => {
    let cell = emptyCell({ isBlack: true });
    cell = revealCell(cell);
    expect(cell.isBlack).toBe(true);
    expect(cell.wasRevealed && cell.isLocked).toBe(true);
  });
});
