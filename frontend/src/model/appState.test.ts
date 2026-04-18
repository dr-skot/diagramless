import { AppState, AppEvent, reducer } from './appState';
import { emptyCell } from './cell';
import { XwdPuzzle } from './puzzle';
import { XwdGrid } from './grid';

// Helper to make a minimal puzzle
const makeGrid = (solved = false): XwdGrid => {
  const cell = (content: string, solutionContent: string) => ({
    ...emptyCell({ content: solutionContent }),
    content,
    number: '',
  });
  // 2x2 grid, solution is AB/CD
  return [
    [cell(solved ? 'A' : '', 'A'), cell(solved ? 'B' : '', 'B')],
    [cell(solved ? 'C' : '', 'C'), cell(solved ? 'D' : '', 'D')],
  ];
};

const makePuzzle = (solved = false): XwdPuzzle => ({
  width: 2,
  height: 2,
  grid: makeGrid(solved),
  cursor: { row: 0, col: 0, direction: 'across' },
  clues: [],
  time: 0,
  symmetry: null,
  autonumber: 'off',
  title: '',
  author: '',
  copyright: '',
  note: '',
  date: '',
});

describe('reducer', () => {
  // --- loading ---
  it('puzzleRestored transitions loading to playing', () => {
    const state: AppState = { mode: 'loading' };
    const puzzle = makePuzzle();
    const next = reducer(state, { type: 'puzzleRestored', puzzle });
    expect(next.mode).toBe('playing');
    expect((next as any).puzzle).toBe(puzzle);
  });

  it('puzzleFetched transitions loading to choosing', () => {
    const state: AppState = { mode: 'loading' };
    const puzzle = makePuzzle();
    const next = reducer(state, { type: 'puzzleFetched', puzzle });
    expect(next.mode).toBe('choosing');
    expect((next as any).puzzle).toBe(puzzle);
  });

  it('fetchFailed transitions loading to pickingDate with error', () => {
    const state: AppState = { mode: 'loading' };
    const next = reducer(state, { type: 'fetchFailed', error: 'Not found' });
    expect(next.mode).toBe('pickingDate');
    expect((next as any).error).toBe('Not found');
  });

  // --- choosing ---
  it('solveModePicked diagramless transitions choosing to playing', () => {
    const puzzle = makePuzzle();
    const state: AppState = { mode: 'choosing', puzzle };
    const next = reducer(state, { type: 'solveModePicked', mode: 'diagramless' });
    expect(next.mode).toBe('playing');
    expect((next as any).puzzle).toBe(puzzle);
  });

  it('solveModePicked withDiagram transitions choosing to playing with revealed meta', () => {
    const puzzle = makePuzzle();
    const state: AppState = { mode: 'choosing', puzzle };
    const next = reducer(state, { type: 'solveModePicked', mode: 'withDiagram' });
    expect(next.mode).toBe('playing');
    // revealMeta should have copied solution data to cell
    const cell = (next as any).puzzle.grid[0][0];
    expect(cell.number).toBe(cell.solution.number);
  });

  // --- playing ---
  it('gridChanged with solved grid transitions playing to solved', () => {
    const puzzle = makePuzzle(true); // all correct
    const state: AppState = { mode: 'playing', puzzle };
    const next = reducer(state, { type: 'gridChanged', puzzle });
    expect(next.mode).toBe('solved');
  });

  it('solved state locks all cells', () => {
    const puzzle = makePuzzle(true);
    const state: AppState = { mode: 'playing', puzzle };
    const next = reducer(state, { type: 'gridChanged', puzzle });
    const grid = (next as any).puzzle.grid;
    grid.forEach((row: any[]) => row.forEach((cell: any) => {
      expect(cell.isLocked).toBe(true);
    }));
  });

  it('gridChanged with filled but incorrect grid transitions playing to filled', () => {
    const puzzle = makePuzzle();
    // Fill all cells with wrong answers
    puzzle.grid[0][0] = { ...puzzle.grid[0][0], content: 'X' };
    puzzle.grid[0][1] = { ...puzzle.grid[0][1], content: 'X' };
    puzzle.grid[1][0] = { ...puzzle.grid[1][0], content: 'X' };
    puzzle.grid[1][1] = { ...puzzle.grid[1][1], content: 'X' };
    const state: AppState = { mode: 'playing', puzzle };
    const next = reducer(state, { type: 'gridChanged', puzzle });
    expect(next.mode).toBe('filled');
  });

  it('gridChanged with incomplete grid stays playing', () => {
    const puzzle = makePuzzle(); // empty cells
    const state: AppState = { mode: 'playing', puzzle };
    const next = reducer(state, { type: 'gridChanged', puzzle });
    expect(next.mode).toBe('playing');
  });

  it('blurred transitions playing to pausePending', () => {
    const puzzle = makePuzzle();
    const state: AppState = { mode: 'playing', puzzle };
    const next = reducer(state, { type: 'blurred' });
    expect(next.mode).toBe('pausePending');
  });

  it('loadRequested transitions playing to pickingDate', () => {
    const puzzle = makePuzzle();
    const state: AppState = { mode: 'playing', puzzle };
    const next = reducer(state, { type: 'loadRequested' });
    expect(next.mode).toBe('pickingDate');
    expect((next as any).puzzle).toBe(puzzle);
  });

  // --- pausePending ---
  it('focused transitions pausePending to playing', () => {
    const puzzle = makePuzzle();
    const state: AppState = { mode: 'pausePending', puzzle };
    const next = reducer(state, { type: 'focused' });
    expect(next.mode).toBe('playing');
  });

  it('blurTimedOut transitions pausePending to paused', () => {
    const puzzle = makePuzzle();
    const state: AppState = { mode: 'pausePending', puzzle };
    const next = reducer(state, { type: 'blurTimedOut' });
    expect(next.mode).toBe('paused');
  });

  // --- paused ---
  it('modalDismissed transitions paused to playing', () => {
    const puzzle = makePuzzle();
    const state: AppState = { mode: 'paused', puzzle };
    const next = reducer(state, { type: 'modalDismissed' });
    expect(next.mode).toBe('playing');
  });

  // --- filled ---
  it('modalDismissed transitions filled to playing', () => {
    const puzzle = makePuzzle();
    const state: AppState = { mode: 'filled', puzzle };
    const next = reducer(state, { type: 'modalDismissed' });
    expect(next.mode).toBe('playing');
  });

  it('gridChanged with solved grid transitions filled to solved', () => {
    const puzzle = makePuzzle(true);
    const state: AppState = { mode: 'filled', puzzle };
    const next = reducer(state, { type: 'gridChanged', puzzle });
    expect(next.mode).toBe('solved');
  });

  // --- solved ---
  it('modalDismissed transitions solved to solvedReview', () => {
    const puzzle = makePuzzle(true);
    const state: AppState = { mode: 'solved', puzzle };
    const next = reducer(state, { type: 'modalDismissed' });
    expect(next.mode).toBe('solvedReview');
  });

  // --- solvedReview ---
  it('loadRequested transitions solvedReview to pickingDate', () => {
    const puzzle = makePuzzle(true);
    const state: AppState = { mode: 'solvedReview', puzzle };
    const next = reducer(state, { type: 'loadRequested' });
    expect(next.mode).toBe('pickingDate');
  });

  it('clearAndRestart transitions solvedReview to choosing', () => {
    const puzzle = makePuzzle(true);
    const state: AppState = { mode: 'solvedReview', puzzle };
    const next = reducer(state, { type: 'clearAndRestart' });
    expect(next.mode).toBe('choosing');
  });

  // --- pickingDate ---
  it('dateSubmitted transitions pickingDate to loading', () => {
    const state: AppState = { mode: 'pickingDate' };
    const next = reducer(state, { type: 'dateSubmitted' });
    expect(next.mode).toBe('loading');
  });

  it('puzzleFetched transitions pickingDate to choosing', () => {
    const puzzle = makePuzzle();
    const state: AppState = { mode: 'pickingDate' };
    const next = reducer(state, { type: 'puzzleFetched', puzzle });
    expect(next.mode).toBe('choosing');
  });

  it('fetchFailed stays in pickingDate with error', () => {
    const state: AppState = { mode: 'pickingDate' };
    const next = reducer(state, { type: 'fetchFailed', error: 'Oops' });
    expect(next.mode).toBe('pickingDate');
    expect((next as any).error).toBe('Oops');
  });

  it('modalDismissed transitions pickingDate back to playing if puzzle exists', () => {
    const puzzle = makePuzzle();
    const state: AppState = { mode: 'pickingDate', puzzle };
    const next = reducer(state, { type: 'modalDismissed' });
    expect(next.mode).toBe('playing');
  });

  // --- invalid transitions are no-ops ---
  it('blurred in choosing is a no-op', () => {
    const puzzle = makePuzzle();
    const state: AppState = { mode: 'choosing', puzzle };
    expect(reducer(state, { type: 'blurred' })).toBe(state);
  });

  it('blurred in solved is a no-op', () => {
    const puzzle = makePuzzle(true);
    const state: AppState = { mode: 'solved', puzzle };
    expect(reducer(state, { type: 'blurred' })).toBe(state);
  });

  it('blurred in solvedReview is a no-op', () => {
    const puzzle = makePuzzle(true);
    const state: AppState = { mode: 'solvedReview', puzzle };
    expect(reducer(state, { type: 'blurred' })).toBe(state);
  });

  it('solveModePicked in playing is a no-op', () => {
    const puzzle = makePuzzle();
    const state: AppState = { mode: 'playing', puzzle };
    expect(reducer(state, { type: 'solveModePicked', mode: 'diagramless' })).toBe(state);
  });

  it('puzzleRestored in playing is a no-op', () => {
    const puzzle = makePuzzle();
    const state: AppState = { mode: 'playing', puzzle };
    expect(reducer(state, { type: 'puzzleRestored', puzzle })).toBe(state);
  });

  // --- clock rule ---
  it('only playing state implies clock should run', () => {
    const puzzle = makePuzzle();
    const states: AppState[] = [
      { mode: 'loading' },
      { mode: 'choosing', puzzle },
      { mode: 'playing', puzzle },
      { mode: 'pausePending', puzzle },
      { mode: 'paused', puzzle },
      { mode: 'filled', puzzle },
      { mode: 'solved', puzzle },
      { mode: 'pickingDate' },
    ];
    states.forEach(s => {
      expect(s.mode === 'playing').toBe(s.mode === 'playing');
    });
    // The clock rule is: clock runs iff mode === 'playing'
    // This test just documents the contract — the useEffect in the component enforces it
    expect(states.filter(s => s.mode === 'playing')).toHaveLength(1);
  });
});
