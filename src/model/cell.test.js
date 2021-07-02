import { newCell, toggleBlack, isCorrect } from './cell';

it("doesn't start black", () => {
  expect(newCell().isBlack).toBe(false);
});

it('can be toggled black/not black', () => {
  let cell = newCell();
  cell = toggleBlack(cell);
  expect(cell.isBlack).toBe(true);
  cell = toggleBlack(cell);
  expect(cell.isBlack).toBe(false);
});

describe('isCorrect', () => {
  it('detects correct blackness', () => {
    let cell = { ...newCell({ isBlack: true }), isBlack: true };
    expect(isCorrect(cell)).toBe(true);
  });
  it('detects incorrect blackness', () => {
    let cell = { ...newCell(), isBlack: true };
    expect(isCorrect(cell)).toBe(false);
  });
  it('ignores content for black cells', () => {
    let cell = {
      ...newCell({ isBlack: true, content: 'B', number: '' }),
      isBlack: true,
      content: 'A',
    };
    expect(isCorrect(cell)).toBe(true);
  });
  it('rejects mismatched content for non-black cells', () => {
    const cell = { ...newCell({ content: 'B' }), content: 'A' };
    expect(isCorrect(cell)).toBe(false);
  });
  it('likes matching content in non-black cells', () => {
    const cell = { ...newCell({ content: 'B' }), content: 'B' };
    expect(isCorrect(cell)).toBe(true);
  });
});
