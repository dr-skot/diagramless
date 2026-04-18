import { changeCells, XwdPuzzle } from './puzzle';
import { gridIsFilled, gridIsSolved } from './grid';
import { revealMeta } from './cell';

// --- States ---

export type AppState =
  | { mode: 'loading' }
  | { mode: 'choosing'; puzzle: XwdPuzzle }
  | { mode: 'playing'; puzzle: XwdPuzzle }
  | { mode: 'pausePending'; puzzle: XwdPuzzle }
  | { mode: 'paused'; puzzle: XwdPuzzle }
  | { mode: 'filled'; puzzle: XwdPuzzle }
  | { mode: 'solved'; puzzle: XwdPuzzle }
  | { mode: 'pickingDate'; puzzle?: XwdPuzzle; error?: string };

// --- Events ---

export type AppEvent =
  | { type: 'puzzleRestored'; puzzle: XwdPuzzle }
  | { type: 'puzzleFetched'; puzzle: XwdPuzzle }
  | { type: 'solveModePicked'; mode: 'diagramless' | 'withDiagram' }
  | { type: 'gridChanged'; puzzle: XwdPuzzle }
  | { type: 'blurred' }
  | { type: 'focused' }
  | { type: 'blurTimedOut' }
  | { type: 'modalDismissed' }
  | { type: 'loadRequested' }
  | { type: 'clearAndRestart' }
  | { type: 'fetchFailed'; error: string };

// --- Helpers ---

function lockAllCells(puzzle: XwdPuzzle): XwdPuzzle {
  return changeCells(() => ({ isLocked: true }))(() => true)(puzzle);
}

function applyRevealMeta(puzzle: XwdPuzzle): XwdPuzzle {
  return changeCells(revealMeta)()(puzzle);
}

function handleGridChanged(state: { mode: string; puzzle: XwdPuzzle }, puzzle: XwdPuzzle): AppState {
  if (gridIsSolved(puzzle.grid)) {
    return { mode: 'solved', puzzle: lockAllCells(puzzle) };
  }
  if (gridIsFilled(puzzle.grid)) {
    return { mode: 'filled', puzzle };
  }
  return { mode: 'playing', puzzle };
}

// --- Reducer ---

export function reducer(state: AppState, event: AppEvent): AppState {
  switch (state.mode) {
    case 'loading':
      switch (event.type) {
        case 'puzzleRestored':
          return { mode: 'playing', puzzle: event.puzzle };
        case 'puzzleFetched':
          return { mode: 'choosing', puzzle: event.puzzle };
        case 'fetchFailed':
          return { mode: 'pickingDate', error: event.error };
        default:
          return state;
      }

    case 'choosing':
      switch (event.type) {
        case 'solveModePicked':
          return {
            mode: 'playing',
            puzzle: event.mode === 'withDiagram'
              ? applyRevealMeta(state.puzzle)
              : state.puzzle,
          };
        default:
          return state;
      }

    case 'playing':
      switch (event.type) {
        case 'gridChanged':
          return handleGridChanged(state, event.puzzle);
        case 'blurred':
          return { mode: 'pausePending', puzzle: state.puzzle };
        case 'loadRequested':
          return { mode: 'pickingDate', puzzle: state.puzzle };
        default:
          return state;
      }

    case 'pausePending':
      switch (event.type) {
        case 'focused':
          return { mode: 'playing', puzzle: state.puzzle };
        case 'blurTimedOut':
          return { mode: 'paused', puzzle: state.puzzle };
        default:
          return state;
      }

    case 'paused':
      switch (event.type) {
        case 'modalDismissed':
          return { mode: 'playing', puzzle: state.puzzle };
        default:
          return state;
      }

    case 'filled':
      switch (event.type) {
        case 'modalDismissed':
          return { mode: 'playing', puzzle: state.puzzle };
        case 'gridChanged':
          return handleGridChanged(state, event.puzzle);
        default:
          return state;
      }

    case 'solved':
      switch (event.type) {
        case 'loadRequested':
          return { mode: 'pickingDate', puzzle: state.puzzle };
        case 'clearAndRestart':
          return { mode: 'choosing', puzzle: state.puzzle };
        default:
          return state;
      }

    case 'pickingDate':
      switch (event.type) {
        case 'puzzleFetched':
          return { mode: 'choosing', puzzle: event.puzzle };
        case 'fetchFailed':
          return { ...state, error: event.error };
        case 'modalDismissed':
          return state.puzzle
            ? { mode: 'playing', puzzle: state.puzzle }
            : state;
        default:
          return state;
      }

    default:
      return state;
  }
}
