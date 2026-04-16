import { puzzleFromXWordInfo, XWordInfoPuzzle } from './xwordinfo';

const minimalPuzzle: XWordInfoPuzzle = {
  title: 'Test Puzzle',
  author: 'Test Author',
  editor: 'Test Editor',
  copyright: '2024',
  publisher: 'Test',
  date: '04/16/2026',
  notepad: 'A note',
  size: { rows: 3, cols: 3 },
  grid: ['A', 'B', 'C', '.', 'D', 'E', 'F', 'G', 'H'],
  gridnums: [1, 2, 0, 0, 3, 0, 4, 0, 0],
  clues: {
    across: ['1. First across', '3. Second across', '4. Third across'],
    down: ['1. First down', '2. Second down'],
  },
  answers: { across: [], down: [] },
};

describe('puzzleFromXWordInfo', () => {
  it('extracts dimensions', () => {
    const result = puzzleFromXWordInfo(minimalPuzzle);
    expect(result).toBeDefined();
    expect(result!.width).toBe(3);
    expect(result!.height).toBe(3);
  });

  it('extracts solution grid', () => {
    const result = puzzleFromXWordInfo(minimalPuzzle);
    expect(result!.solution).toEqual(['A', 'B', 'C', '.', 'D', 'E', 'F', 'G', 'H']);
  });

  it('combines author and editor', () => {
    const result = puzzleFromXWordInfo(minimalPuzzle);
    expect(result!.author).toBe('Test Author / Test Editor');
  });

  it('uses author alone when no editor', () => {
    const noEditor = { ...minimalPuzzle, editor: '' };
    const result = puzzleFromXWordInfo(noEditor);
    expect(result!.author).toBe('Test Author');
  });

  it('parses clues with direction vectors', () => {
    const result = puzzleFromXWordInfo(minimalPuzzle);
    expect(result!.clues).toContainEqual({ number: '1', direction: [0, 1], clue: 'First across' });
    expect(result!.clues).toContainEqual({ number: '1', direction: [1, 0], clue: 'First down' });
  });

  it('skips malformed clues', () => {
    const badClues = {
      ...minimalPuzzle,
      clues: {
        across: ['1. Good clue', 'bad clue no number'],
        down: [],
      },
    };
    const result = puzzleFromXWordInfo(badClues);
    expect(result!.clues).toHaveLength(1);
  });

  it('maps circles to GEXT bytes', () => {
    const withCircles = {
      ...minimalPuzzle,
      circles: [0, 1, 0, 0, 0, 2, 0, 0, 0],
    };
    const result = puzzleFromXWordInfo(withCircles);
    expect(result!.extras.GEXT[1]).toBe(0x80);
    expect(result!.extras.GEXT[0]).toBe(0);
  });

  it('maps shaded squares from circles array', () => {
    const withShaded = {
      ...minimalPuzzle,
      circles: [0, 0, 0, 0, 0, 2, 0, 0, 0],
    };
    const result = puzzleFromXWordInfo(withShaded);
    expect(result!.extras.shaded[5]).toBe(true);
    expect(result!.extras.shaded[0]).toBe(false);
  });

  it('returns null for falsy input', () => {
    expect(puzzleFromXWordInfo(null as any)).toBeNull();
  });
});
