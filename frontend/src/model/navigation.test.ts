import { LEFT, RIGHT, UP, DOWN, ACROSS, vectorFor, backVectorFor, perp, isPerpendicular, moveOnGrid, moveOnGridUntil, Vector } from './navigation';

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

describe('moveOnGrid', () => {
  it('simply moves if not at edge', () => {
    expect(moveOnGrid([0, 1], RIGHT, [2, 7])).toEqual([0, 2]);
    expect(moveOnGrid([0, 2], DOWN, [2, 7])).toEqual([1, 2]);
    expect(moveOnGrid([1, 2], LEFT, [2, 7])).toEqual([1, 1]);
    expect(moveOnGrid([1, 1], UP, [2, 7])).toEqual([0, 1]);
  });

  it('wraps around at edge by default', () => {
    expect(moveOnGrid([0, 1], UP, [2, 7])).toEqual([1, 1]);
    expect(moveOnGrid([1, 1], DOWN, [2, 7])).toEqual([0, 1]);
    expect(moveOnGrid([1, 0], LEFT, [2, 7])).toEqual([1, 6]);
    expect(moveOnGrid([1, 6], RIGHT, [2, 7])).toEqual([1, 0]);
  });

  it('stops at edge if you tell it to', () => {
    const dim: Vector = [2, 7],
      opts = { atLineEnd: 'STOP' as const };
    expect(moveOnGrid([0, 1], UP, dim, opts)).toEqual([0, 1]);
    expect(moveOnGrid([1, 1], DOWN, dim, opts)).toEqual([1, 1]);
    expect(moveOnGrid([1, 0], LEFT, dim, opts)).toEqual([1, 0]);
    expect(moveOnGrid([1, 6], RIGHT, dim, opts)).toEqual([1, 6]);
  });

  it("doesn't mutate the direction when next-line wrapping", () => {
    const dim: Vector = [2, 7],
      opts = { atLineEnd: 'NEXT_LINE' as const };
    moveOnGrid([0, 1], UP, dim, opts);
    expect(UP).toEqual([-1, 0]);
  });

  it('wraps to next line if you tell it to', () => {
    const dim: Vector = [2, 7],
      opts = { atLineEnd: 'NEXT_LINE' as const };
    expect(moveOnGrid([0, 1], UP, dim, opts)).toEqual([1, 0]);
    expect(moveOnGrid([1, 1], DOWN, dim, opts)).toEqual([0, 2]);
    expect(moveOnGrid([1, 0], LEFT, dim, opts)).toEqual([0, 6]);
    expect(moveOnGrid([1, 6], RIGHT, dim, opts)).toEqual([0, 0]);
  });

  it('triggers callback upon puzzle wrap', () => {
    let triggered = false;
    const dim: Vector = [2, 7],
      opts = {
        atLineEnd: 'NEXT_LINE' as const,
        onPuzzleWrap: () => {
          triggered = true;
        },
      };

    moveOnGrid([1, 6], RIGHT, dim, opts);
    expect(triggered).toBe(true);

    triggered = false;
    moveOnGrid([0, 0], UP, dim, opts);
    expect(triggered).toBe(true);
  });
});

describe('moveOnGridUntil', () => {
  it('stops when it gets back to original cursor position', () => {
    const never = () => false;
    expect(moveOnGridUntil(never, [1, 1], RIGHT, [4, 4])).toEqual([1, 1]);
  });
  it('stops if it gets stuck', () => {
    const never = () => false;
    expect(moveOnGridUntil(never, [1, 1], RIGHT, [3, 3], { atLineEnd: 'STOP' as const })).toEqual([1, 2]);
  });
  it('stops when the condition is met', () => {
    const condition = (position: number[]) => position[1] === 2;
    expect(moveOnGridUntil(condition, [1, 1], RIGHT, [4, 4])).toEqual([1, 2]);
  });
  it('can be invoked as an option using moveOnGrid', () => {
    const options = { until: (position: number[]) => position[1] === 2 };
    expect(moveOnGrid([1, 1], RIGHT, [4, 4], options)).toEqual([1, 2]);
  });
});
