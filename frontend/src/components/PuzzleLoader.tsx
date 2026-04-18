import React, { Dispatch, SetStateAction, useEffect, useReducer, useRef, useState } from 'react';
import { DEFAULT_PUZZLE } from '../model/defaultPuzzle';
import { migratePuzzle, puzzleFromFile, XwdPuzzle } from '../model/puzzle';
import { tryToParse } from '../utils/utils';
import Clock from '../model/clock';
import Puzzle from './Puzzle';
import { handleDroppedFile } from '../utils/dom';
import { numberPuzzle } from '../model/numbering';
import { LoadPuzzleModal } from './LoadPuzzleModal';
import { fetchPuzzle } from '../services/xwordInfoService';
import { formatDate, isValidMdy } from '../utils/dateUtils';
import './PuzzleLoader.css';
import { getPuzzleDate } from '../model/puzzle';
import { AppState, reducer } from '../model/appState';
import PuzzleModal, { ModalReason } from './PuzzleModal';
import SolveModeModal from './SolveModeModal';

const BLUR_INTERVAL = 10000;

const loadPuzzleFromStorage = () => migratePuzzle(tryToParse(localStorage.getItem('xword2') || '', DEFAULT_PUZZLE));

const storePuzzle = (puzzle: XwdPuzzle, clock: Clock) => {
  localStorage.setItem('xword2', JSON.stringify({ ...puzzle, time: clock.getTime() }));
};

export type PuzzleDispatch = Dispatch<SetStateAction<XwdPuzzle>>;

// Parse date from URL parameter (format: mm/dd/yyyy)
const getDateFromUrl = (): string => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('date') || '';
};

function getDefaultDate(): Date {
  const urlDate = getDateFromUrl();
  return isValidMdy(urlDate) ? new Date(urlDate) : new Date();
}

// Update URL with date parameter
const updateUrlWithDate = (date: string) => {
  const baseUrl = window.location.href.split('?')[0];
  const search = date === formatDate('MM/DD/YYYY') ? '' : `?date=${date}`;
  window.history.pushState({}, '', `${baseUrl}${search}`);
};

// Map app state mode to modal reason
function getModalReason(state: AppState): ModalReason | null {
  switch (state.mode) {
    case 'paused': return 'PAUSED';
    case 'filled': return 'FILLED';
    case 'solved': return 'SOLVED';
    default: return null;
  }
}

// Get puzzle from state (if any)
function getPuzzleFromState(state: AppState): XwdPuzzle | undefined {
  if ('puzzle' in state) return state.puzzle;
  return undefined;
}

export default function PuzzleLoader() {
  const [state, dispatch] = useReducer(reducer, { mode: 'loading' } as AppState);
  const [clock] = useState(() => new Clock(0));
  const blurTimeoutRef = useRef<number>(0);

  const puzzle = getPuzzleFromState(state);

  // --- Initial load ---
  useEffect(() => {
    const stored = loadPuzzleFromStorage();
    const dateParam = getDateFromUrl() || formatDate('MM/DD/YYYY');

    // If we have a stored puzzle and it matches the URL date (or no date param), restore it
    if (stored && stored.grid && stored.grid.length > 0) {
      const storedDate = getPuzzleDate(stored);
      if (!getDateFromUrl() || storedDate === dateParam) {
        clock.setTime(stored.time || 0);
        dispatch({ type: 'puzzleRestored', puzzle: stored });
        if (storedDate) updateUrlWithDate(storedDate);
        return;
      }
    }

    // Otherwise fetch from API
    fetchPuzzleForDate(dateParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Clock syncs with state ---
  useEffect(() => {
    if (state.mode === 'playing') clock.start();
    else clock.stop();
    if (state.mode === 'choosing' && puzzle?.time === 0) clock.setTime(0);
  }, [state.mode, clock, puzzle?.time]);

  // --- Blur/focus for pause ---
  useEffect(() => {
    const handleBlur = () => {
      dispatch({ type: 'blurred' });
      blurTimeoutRef.current = window.setTimeout(() => {
        dispatch({ type: 'blurTimedOut' });
      }, BLUR_INTERVAL);
    };
    const handleFocus = () => {
      window.clearTimeout(blurTimeoutRef.current);
      dispatch({ type: 'focused' });
    };
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // --- Save to localStorage on puzzle change ---
  useEffect(() => {
    if (!puzzle) return;
    storePuzzle(puzzle, clock);
    const savePuzzle = () => storePuzzle(puzzle, clock);
    window.addEventListener('beforeunload', savePuzzle);
    return () => window.removeEventListener('beforeunload', savePuzzle);
  }, [puzzle, clock]);

  // --- Puzzle state setter ---
  const setPuzzle: PuzzleDispatch = (action) => {
    const newPuzzle = typeof action === 'function'
      ? action(puzzle!)
      : action;
    dispatch({ type: 'puzzleUpdated', puzzle: newPuzzle });
  };

  // --- Fetch puzzle by date ---
  function fetchPuzzleForDate(dateToLoad: string) {
    updateUrlWithDate(dateToLoad);
    if (puzzle && dateToLoad === getPuzzleDate(puzzle)) return;

    if (!isValidMdy(dateToLoad)) {
      dispatch({ type: 'fetchFailed', error: `Invalid date format: ${dateToLoad}. Use mm/dd/yyyy.` });
      return;
    }

    dispatch({ type: 'dateSubmitted' });
    fetchPuzzle(dateToLoad)
      .then((newPuzzle) => {
        if (newPuzzle) {
          newPuzzle.autonumber = puzzle?.autonumber || 'off';
          newPuzzle.symmetry = newPuzzle.symmetry || puzzle?.symmetry || null;
          clock.setTime(newPuzzle.time || 0);
          dispatch({ type: 'puzzleFetched', puzzle: numberPuzzle(newPuzzle) });
          updateUrlWithDate(dateToLoad);
        } else {
          dispatch({ type: 'fetchFailed', error: `No puzzle found for date: ${dateToLoad}` });
        }
      })
      .catch((error: Error) => {
        dispatch({ type: 'fetchFailed', error: error.message });
      });
  }

  // --- Load puzzle modal handlers ---
  const handleLoadPuzzleSubmit = (date: Date) => {
    fetchPuzzleForDate(formatDate('MM/DD/YYYY', date));
  };

  const handleLoadPuzzleCancel = () => {
    dispatch({ type: 'modalDismissed' });
    if (puzzle) {
      const puzzleDate = getPuzzleDate(puzzle);
      if (puzzleDate) updateUrlWithDate(puzzleDate);
    }
  };

  // --- File drop ---
  const onDrop = handleDroppedFile((contents) => {
    const newPuzzle = puzzleFromFile(contents);
    if (newPuzzle) {
      newPuzzle.autonumber = puzzle?.autonumber || 'off';
      newPuzzle.symmetry = newPuzzle.symmetry || puzzle?.symmetry || null;
      clock.setTime(newPuzzle.time || 0);
      dispatch({ type: 'puzzleFetched', puzzle: numberPuzzle(newPuzzle) });
    }
  });

  // --- File drop from load modal ---
  const handleFileDrop = (contents: ArrayBuffer) => {
    const newPuzzle = puzzleFromFile(contents);
    if (newPuzzle) {
      newPuzzle.autonumber = puzzle?.autonumber || 'off';
      newPuzzle.symmetry = newPuzzle.symmetry || puzzle?.symmetry || null;
      clock.setTime(newPuzzle.time || 0);
      dispatch({ type: 'puzzleFetched', puzzle: numberPuzzle(newPuzzle) });
    } else {
      dispatch({ type: 'fetchFailed', error: 'Not a valid .puz file' });
    }
  };

  // --- Modal dismiss ---
  const handleModalClose = (reason: ModalReason) => {
    dispatch({ type: 'modalDismissed' });
  };

  // --- Render ---
  const modalReason = getModalReason(state);
  const showLoadModal = state.mode === 'pickingDate';

  return (
    <div className="puzzle-loader">
      {state.mode === 'loading' && (
        <div className="modal-dimmer display-block ModalWrapper-wrapper ModalWrapper-stretch">
          <div className="ModalBody-body" style={{ textAlign: 'center', fontFamily: 'franklin', fontSize: '1rem' }}>
            Loading puzzle...
          </div>
        </div>
      )}

      {showLoadModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <LoadPuzzleModal
              onSubmit={handleLoadPuzzleSubmit}
              onCancel={handleLoadPuzzleCancel}
              onFileDrop={handleFileDrop}
              error={(state as any).error || ''}
              defaultDate={getDefaultDate()}
              loading={false}
            />
          </div>
        </div>
      )}

      {state.mode === 'choosing' && puzzle && (
        <SolveModeModal onChoose={(mode) => dispatch({ type: 'solveModePicked', mode })} />
      )}

      {puzzle && (
        <>
          <div className={state.mode === 'paused' ? 'app-obscured' : ''}>
            <Puzzle
              puzzle={puzzle}
              setPuzzle={setPuzzle}
              clock={clock}
              onDrop={onDrop}
              onLoadPuzzle={() => dispatch({ type: 'loadRequested' })}
              onPause={() => dispatch({ type: 'pauseRequested' })}
              onClearAndRestart={() => dispatch({ type: 'clearAndRestart' })}
              diagramRevealed={'diagramRevealed' in state && !!state.diagramRevealed}
            />
          </div>
          {modalReason && <PuzzleModal reason={modalReason} onClose={handleModalClose} />}
        </>
      )}
    </div>
  );
}
