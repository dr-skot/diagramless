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

function getPuzzleDate(puzzle: XwdPuzzle) {
  let date = '';
  if (puzzle.date) return puzzle.date;
  if (puzzle.title) {
    const dateMatch = puzzle.title.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (dateMatch) {
      const [, month, day, year] = dateMatch;
      date = `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
      console.log('Extracted date from title:', date);
    } else {
      // Try to extract date using PuzzleHeader's regex patterns
      let titlePieces =
        puzzle.title.match(/(?:NY|New York) Times,\s+(\w+,\s+\w+\s+\d+,\s+\d+)(.*)/) || [];
      if (!titlePieces || titlePieces.length < 2) {
        // Try another format that might be used
        titlePieces = puzzle.title.match(/(\w+,\s+\w+\s+\d+,\s+\d+)(.*)/) || [];
      }

      const dateStr = titlePieces[1] || '';
      if (dateStr) {
        console.log('Date string extracted from title:', dateStr);
        const titleDate = new Date(dateStr);
        if (!isNaN(titleDate.getTime())) {
          date = formatDate('MM/DD/YYYY', titleDate);
          console.log('Converted to MM/DD/YYYY format:', date);
        } else {
          console.log('Could not convert date string to Date object');
        }
      } else {
        console.log('No date string found using PuzzleHeader regex patterns');
      }
      console.log('No date found in title:', puzzle.title);
    }
  } else {
    console.log('No title found in puzzle');
  }
  return date;
}

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
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('puzzle', puzzle);
  }, [puzzle]);

  // Load puzzle from URL date parameter on initial load
  useEffect(() => {
    fetchPuzzleForDate(getDateFromUrl() || formatDate('MM/DD/YYYY'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const savePuzzle = () => storePuzzle({ ...puzzle, time: clock.getTime() });
    (gridIsSolved(puzzle.grid) ? clock.stop : clock.start)();
    savePuzzle();
    window.addEventListener('beforeunload', savePuzzle);
    return () => window.removeEventListener('beforeunload', savePuzzle);
  }, [puzzle, clock]);

  // TODO is this needed?
  useEffect(() => {
    if (showLoadPuzzleModal && modalContentRef.current) {
      modalContentRef.current.focus();
    }
  }, [showLoadPuzzleModal]);

  const onDrop = handleDroppedFile((contents) => {
    const newPuzzle = puzzleFromFile(contents);
    if (!newPuzzle) return;
    // preserve numbering / symmetry settings
    newPuzzle.autonumber = puzzle.autonumber;
    newPuzzle.symmetry = puzzle.symmetry;
    // set clock
    clock.setTime(newPuzzle.time || 0);
    setPuzzle(numberPuzzle(newPuzzle));
  });

  const handleLoadPuzzle = () => {
    setShowLoadPuzzleModal(true);
  };

  function fetchPuzzleForDate(dateToLoad: string) {
    setShowLoadPuzzleModal(false);
    setLoadError('');
    updateUrlWithDate(dateToLoad);
    if (dateToLoad === getPuzzleDate(puzzle)) return;
    setLoading(true);
    fetchPuzzleFromUrl()
      .then((newPuzzle) => {
        newPuzzle.autonumber = puzzle.autonumber;
        newPuzzle.symmetry = puzzle.symmetry;
        // set clock
        clock.setTime(newPuzzle.time || 0);
        setPuzzle(numberPuzzle(newPuzzle));
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
    console.log('puzzle:', puzzle);
    console.log('puzzleDate', getPuzzleDate(puzzle));
    const puzzleDate = getPuzzleDate(puzzle);
    if (puzzleDate) updateUrlWithDate(puzzleDate);
  };

  return (
    <div className="puzzle-loader">
      {showLoadPuzzleModal && (
        <div className="modal-overlay">
          <div className="modal-content" ref={modalContentRef} tabIndex={0}>
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
        onLoadPuzzle={handleLoadPuzzle}
      />
    </div>
  );
}
