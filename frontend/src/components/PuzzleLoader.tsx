import React, { Dispatch, SetStateAction, useEffect, useState, useRef } from 'react';
import { DEFAULT_PUZZLE } from '../model/defaultPuzzle';
import { puzzleFromFile, XwdPuzzle } from '../model/puzzle';
import { tryToParse } from '../utils/utils';
import Clock from '../model/clock';
import { gridIsSolved } from '../model/grid';
import Puzzle from './Puzzle';
import { handleDroppedFile } from '../utils/dom';
import { numberPuzzle } from '../model/numbering';
import { LoadPuzzleModal } from './LoadPuzzleModal';
import { fetchPuzzle } from '../services/xwordInfoService';
import { formatDate, isValidMdy } from '../utils/dateUtils';
import './PuzzleLoader.css';
import { getPuzzleDate } from '../services/xwdService';

const loadPuzzle = () => tryToParse(localStorage.getItem('xword2') || '', DEFAULT_PUZZLE);

const storePuzzle = (puzzle: XwdPuzzle) => {
  localStorage.setItem('xword2', JSON.stringify(puzzle));
};

export type PuzzleDispatch = Dispatch<SetStateAction<XwdPuzzle>>;

// Parse date from URL parameter (format: mm/dd/yyyy)
const getDateFromUrl = (): string => {
  const urlParams = new URLSearchParams(window.location.search);
  console.log('getDateFromUrl', urlParams.get('date'));
  return urlParams.get('date') || '';
};

function getDefaultDate(): Date {
  const urlDate = getDateFromUrl();
  return isValidMdy(urlDate) ? new Date(urlDate) : new Date();
}

const fetchPuzzleFromUrl = async () => {
  const dateParam = getDateFromUrl() || formatDate('MM/DD/YYYY');
  let puzzle: XwdPuzzle | null;
  if (!isValidMdy(dateParam)) {
    throw new Error(`Invalid date format: ${dateParam}. Use mm/dd/yyyy.`);
  }
  try {
    puzzle = await fetchPuzzle(dateParam);
  } catch (error) {
    throw new Error(`Error loading puzzle`, { cause: error });
  }
  if (puzzle) return puzzle;
  else throw new Error(`No puzzle found for date: ${dateParam}`);
};

// Update URL with date parameter
const updateUrlWithDate = (date: string) => {
  // Manually construct URL to avoid escaping slashes
  const baseUrl = window.location.href.split('?')[0];
  const search = date === formatDate('MM/DD/YYYY') ? '' : `?date=${date}`;
  window.history.pushState({}, '', `${baseUrl}${search}`);
};

export default function PuzzleLoader() {
  const [puzzle, setPuzzle] = useState<XwdPuzzle>(loadPuzzle());
  const [clock] = useState(new Clock(puzzle.time));
  const [showLoadPuzzleModal, setShowLoadPuzzleModal] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load puzzle from URL date parameter on initial load
  useEffect(() => {
    fetchPuzzleForDate(getDateFromUrl() || formatDate('MM/DD/YYYY'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save puzzle before unloading
  useEffect(() => {
    const savePuzzle = () => storePuzzle({ ...puzzle, time: clock.getTime() });
    (gridIsSolved(puzzle.grid) ? clock.stop : clock.start)();
    savePuzzle();
    window.addEventListener('beforeunload', savePuzzle);
    return () => window.removeEventListener('beforeunload', savePuzzle);
  }, [puzzle, clock]);

  // Replace puzzle and update clock
  function replacePuzzle(newPuzzle: XwdPuzzle) {
    newPuzzle.autonumber = puzzle.autonumber;
    newPuzzle.symmetry ||= puzzle.symmetry;
    // set clock
    clock.setTime(newPuzzle.time || 0);
    setPuzzle(numberPuzzle(newPuzzle));
  }

  const onDrop = handleDroppedFile((contents) => {
    const newPuzzle = puzzleFromFile(contents);
    if (newPuzzle) replacePuzzle(newPuzzle);
  });

  function fetchPuzzleForDate(dateToLoad: string) {
    setShowLoadPuzzleModal(false);
    setLoadError('');
    updateUrlWithDate(dateToLoad);
    if (dateToLoad === getPuzzleDate(puzzle)) return;
    setLoading(true);
    fetchPuzzleFromUrl()
      .then((newPuzzle) => {
        replacePuzzle(newPuzzle);
        updateUrlWithDate(dateToLoad);
      })
      .catch((error: Error) => {
        setLoadError(error.message);
        setShowLoadPuzzleModal(true);
      })
      .finally(() => setLoading(false));
  }

  const handleLoadPuzzleSubmit = (date: Date) => {
    fetchPuzzleForDate(formatDate('MM/DD/YYYY', date));
  };

  const handleLoadPuzzleCancel = () => {
    setShowLoadPuzzleModal(false);
    setLoadError('');
    const puzzleDate = getPuzzleDate(puzzle);
    if (puzzleDate) updateUrlWithDate(puzzleDate);
  };

  return (
    <div className="puzzle-loader">
      {showLoadPuzzleModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <LoadPuzzleModal
              onSubmit={handleLoadPuzzleSubmit}
              onCancel={handleLoadPuzzleCancel}
              error={loadError}
              defaultDate={getDefaultDate()}
              loading={loading}
            />
          </div>
        </div>
      )}

      <Puzzle
        puzzle={puzzle}
        setPuzzle={setPuzzle}
        clock={clock}
        onDrop={onDrop}
        onLoadPuzzle={()=>setShowLoadPuzzleModal(true)}
      />
    </div>
  );
}
