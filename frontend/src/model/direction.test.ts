import { backVector, isPerpendicular, directionVector } from './direction';

describe('vector/backVector', () => {
  it('returns [0, ±1] for across', () => {
    expect(directionVector('across')).toEqual([0, 1]);
    expect(backVector('across')).toEqual([0, -1]);
  });
  it('returns [±1, 0] for down', () => {
    expect(directionVector('down')).toEqual([1, 0]);
    expect(backVector('down')).toEqual([-1, 0]);
  });
});

describe('isPerpendicular', () => {
  it('knows vertical is perp to across', () => {
    expect(isPerpendicular('across', [5, 0])).toBe(true);
    expect(isPerpendicular('across', [-3, 0])).toBe(true);
    expect(isPerpendicular('across', [0, 1])).toBe(false);
    expect(isPerpendicular('across', [3, 1])).toBe(false);
  });
  it('knows vertical is perp to across', () => {
    expect(isPerpendicular('down', [0, 5])).toBe(true);
    expect(isPerpendicular('down', [0, -8])).toBe(true);
    expect(isPerpendicular('down', [1, 0])).toBe(false);
    expect(isPerpendicular('down', [1, 3])).toBe(false);
  });
});
