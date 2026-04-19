import { changeCells, XwdPuzzle } from './puzzle';
import { gridIsFilled, gridIsSolved } from './grid';
import { clearCell, revealMeta } from './cell';

// --- States ---

export type AppState =
  | { mode: 'loading' }
  | { mode: 'confirmSubscription'; puzzle: XwdPuzzle }
  | { mode: 'choosing'; puzzle: XwdPuzzle }
  | { mode: 'playing'; puzzle: XwdPuzzle; diagramRevealed?: boolean }
  | { mode: 'showingHelp'; puzzle: XwdPuzzle; diagramRevealed?: boolean }
  | { mode: 'pausePending'; puzzle: XwdPuzzle }
  | { mode: 'paused'; puzzle: XwdPuzzle }
  | { mode: 'filled'; puzzle: XwdPuzzle }
  | { mode: 'solved'; puzzle: XwdPuzzle }
  | { mode: 'solvedReview'; puzzle: XwdPuzzle }
  | { mode: 'pickingDate'; puzzle?: XwdPuzzle; error?: string };

// --- Events ---

export type AppEvent =
  | { type: 'puzzleRestored'; puzzle: XwdPuzzle }
  | { type: 'puzzleFetched'; puzzle: XwdPuzzle }
  | { type: 'subscriptionConfirmed' }
  | { type: 'solveModePicked'; mode: 'diagramless' | 'withDiagram'; showHelp?: boolean }
  | { type: 'puzzleUpdated'; puzzle: XwdPuzzle }
  | { type: 'gridChanged'; puzzle: XwdPuzzle }
  | { type: 'blurred' }
  | { type: 'focused' }
  | { type: 'blurTimedOut' }
  | { type: 'modalDismissed' }
  | { type: 'helpRequested' }
  | { type: 'loadRequested' }
  | { type: 'pauseRequested' }
  | { type: 'dateSubmitted' }
  | { type: 'clearAndRestart' }
  | { type: 'fetchFailed'; error: string };

// --- Queries ---

export function shouldObscurePuzzle(state: AppState): boolean {
  return state.mode === 'paused' || state.mode === 'showingHelp' ||
    state.mode === 'confirmSubscription' || state.mode === 'choosing';
}

// --- Helpers ---

function lockAllCells(puzzle: XwdPuzzle): XwdPuzzle {
  return changeCells(() => ({ isLocked: true }))(() => true)(puzzle);
}

function applyRevealMeta(puzzle: XwdPuzzle): XwdPuzzle {
  return changeCells(revealMeta)()(puzzle);
}

function clearPuzzle(puzzle: XwdPuzzle): XwdPuzzle {
  return { ...changeCells(clearCell)()(puzzle), time: 0 };
}

function handleGridChanged(state: AppState & { puzzle: XwdPuzzle }, puzzle: XwdPuzzle): AppState {
  const diagramRevealed = 'diagramRevealed' in state ? state.diagramRevealed : undefined;
  if (gridIsSolved(puzzle.grid)) {
    return { mode: 'solved', puzzle: lockAllCells(puzzle) };
  }
  if (gridIsFilled(puzzle.grid)) {
    return { mode: 'filled', puzzle };
  }
  return { mode: 'playing', puzzle, diagramRevealed };
}

// --- Reducer ---

export function reducer(state: AppState, event: AppEvent): AppState {
  switch (state.mode) {
    case 'loading':
      switch (event.type) {
        case 'puzzleRestored':
          return { mode: 'playing', puzzle: event.puzzle };
        case 'puzzleFetched':
          return { mode: 'confirmSubscription', puzzle: event.puzzle };
        case 'fetchFailed':
          return { mode: 'pickingDate', error: event.error };
        default:
          return state;
      }

    case 'confirmSubscription':
      switch (event.type) {
        case 'subscriptionConfirmed':
          return { mode: 'choosing', puzzle: state.puzzle };
        default:
          return state;
      }

    case 'choosing':
      switch (event.type) {
        case 'solveModePicked': {
          const puzzle = event.mode === 'withDiagram'
            ? applyRevealMeta(state.puzzle) : state.puzzle;
          const diagramRevealed = event.mode === 'withDiagram';
          return event.showHelp
            ? { mode: 'showingHelp' as const, puzzle, diagramRevealed }
            : { mode: 'playing' as const, puzzle, diagramRevealed };
        }
        default:
          return state;
      }

    case 'playing':
      switch (event.type) {
        case 'puzzleUpdated':
          if (event.puzzle.grid === state.puzzle.grid) {
            return { ...state, puzzle: event.puzzle };
          }
          return handleGridChanged(state, event.puzzle);
        case 'gridChanged':
          return handleGridChanged(state, event.puzzle);
        case 'blurred':
          return { mode: 'pausePending', puzzle: state.puzzle };
        case 'pauseRequested':
          return { mode: 'paused', puzzle: state.puzzle };
        case 'helpRequested':
          return { mode: 'showingHelp', puzzle: state.puzzle, diagramRevealed: state.diagramRevealed };
        case 'loadRequested':
          return { mode: 'pickingDate', puzzle: state.puzzle };
        default:
          return state;
      }

    case 'showingHelp':
      switch (event.type) {
        case 'modalDismissed':
          return { mode: 'playing', puzzle: state.puzzle, diagramRevealed: state.diagramRevealed };
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
        case 'modalDismissed':
          return { mode: 'solvedReview', puzzle: state.puzzle };
        default:
          return state;
      }

    case 'solvedReview':
      switch (event.type) {
        case 'puzzleUpdated':
          // Only allow cursor changes, not grid changes
          if (event.puzzle.grid === state.puzzle.grid) {
            return { ...state, puzzle: event.puzzle };
          }
          return state;
        case 'loadRequested':
          return { mode: 'pickingDate', puzzle: state.puzzle };
        case 'clearAndRestart':
          return { mode: 'choosing', puzzle: clearPuzzle(state.puzzle) };
        default:
          return state;
      }

    case 'pickingDate':
      switch (event.type) {
        case 'dateSubmitted':
          return { mode: 'loading' };
        case 'puzzleFetched':
          return { mode: 'confirmSubscription', puzzle: event.puzzle };
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
