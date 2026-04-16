import { LEFT, RIGHT, UP, DOWN, ACROSS, vectorFor, backVectorFor, perp, isPerpendicular } from './navigation';

describe('direction constants', () => {
  it('LEFT is [0, -1]', () => expect(LEFT).toEqual([0, -1]));
  it('RIGHT is [0, 1]', () => expect(RIGHT).toEqual([0, 1]));
  it('UP is [-1, 0]', () => expect(UP).toEqual([-1, 0]));
  it('DOWN is [1, 0]', () => expect(DOWN).toEqual([1, 0]));
  it('ACROSS is same as RIGHT', () => expect(ACROSS).toEqual(RIGHT));
});

describe('vectorFor/backVectorFor', () => {
  it('returns [0, ±1] for across', () => {
    expect(vectorFor('across')).toEqual([0, 1]);
    expect(backVectorFor('across')).toEqual([0, -1]);
  });
  it('returns [±1, 0] for down', () => {
    expect(vectorFor('down')).toEqual([1, 0]);
    expect(backVectorFor('down')).toEqual([-1, 0]);
  });
});

describe('perp', () => {
  it('flips across to down and vice versa', () => {
    expect(perp('across')).toBe('down');
    expect(perp('down')).toBe('across');
  });
});

describe('isPerpendicular', () => {
  it('knows vertical is perp to across', () => {
    expect(isPerpendicular('across', [5, 0])).toBe(true);
    expect(isPerpendicular('across', [-3, 0])).toBe(true);
    expect(isPerpendicular('across', [0, 1])).toBe(false);
    expect(isPerpendicular('across', [3, 1])).toBe(false);
  });
  it('knows horizontal is perp to down', () => {
    expect(isPerpendicular('down', [0, 5])).toBe(true);
    expect(isPerpendicular('down', [0, -8])).toBe(true);
    expect(isPerpendicular('down', [1, 0])).toBe(false);
    expect(isPerpendicular('down', [1, 3])).toBe(false);
  });
});
