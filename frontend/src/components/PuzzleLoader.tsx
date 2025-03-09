import React, { Dispatch, SetStateAction, useEffect, useState, useRef } from 'react';
import { DEFAULT_PUZZLE } from '../model/defaultPuzzle';
import { puzzleFromFile, XwdPuzzle } from '../model/puzzle';
import { tryToParse } from '../utils/utils';
import Clock from '../model/clock';
import { gridIsSolved } from '../model/grid';
import Puzzle from './Puzzle';
import { handleDroppedFile } from '../utils/dom';
import { numberPuzzle } from '../model/numbering';
import { XWordInfoImporter } from './XWordInfoImporter';
import { fetchPuzzleFromXWordInfo } from '../services/xwordInfoService';
import './PuzzleLoader.css';

const loadPuzzle = () => tryToParse(localStorage.getItem('xword2') || '', DEFAULT_PUZZLE);

const storePuzzle = (puzzle: XwdPuzzle) => {
  localStorage.setItem('xword2', JSON.stringify(puzzle));
};

export type PuzzleDispatch = Dispatch<SetStateAction<XwdPuzzle>>;

// Parse date from URL parameter (format: mm/dd/yyyy)
const getDateFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const dateParam = urlParams.get('date');
  
  if (!dateParam) return null;
  
  // Validate date format (mm/dd/yyyy)
  const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(\d{4})$/;
  return dateRegex.test(dateParam) ? dateParam : null;
};

// Update URL with date parameter
const updateUrlWithDate = (date: string) => {
  // Manually construct URL to avoid escaping slashes
  const baseUrl = window.location.href.split('?')[0];
  window.history.pushState({}, '', `${baseUrl}?date=${date}`);
};

// Get today's date in MM/DD/YYYY format
const getTodayDateString = (): string => {
  const today = new Date();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const year = today.getFullYear();
  return `${month}/${day}/${year}`;
};

export default function PuzzleLoader() {
  const [puzzle, setPuzzle] = useState<XwdPuzzle>(loadPuzzle());
  const [clock] = useState(new Clock(puzzle.time));
  const [showXWordInfoImporter, setShowXWordInfoImporter] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Load puzzle from URL date parameter on initial load
  useEffect(() => {
    const loadPuzzleFromUrl = async () => {
      const dateParam = getDateFromUrl();
      if (dateParam) {
        // Always store the date from URL for future use
        console.log('Setting defaultDate from URL:', dateParam);
        setDefaultDate(dateParam);
        
        try {
          const newPuzzle = await fetchPuzzleFromXWordInfo(dateParam);
          if (newPuzzle) {
            // preserve numbering / symmetry settings
            newPuzzle.autonumber = puzzle.autonumber;
            newPuzzle.symmetry = puzzle.symmetry;
            // set clock
            clock.setTime(newPuzzle.time || 0);
            setPuzzle(numberPuzzle(newPuzzle));
          } else {
            setLoadError(`No puzzle found for date: ${dateParam}`);
            setShowXWordInfoImporter(true);
          }
        } catch (error) {
          console.error('Error loading puzzle from URL:', error);
          setLoadError(`Failed to load puzzle for date: ${dateParam}`);
          setShowXWordInfoImporter(true);
        }
      } else if (dateParam === null && window.location.search.includes('date=')) {
        // Invalid date format in URL
        const invalidDate = window.location.search.split('date=')[1]?.split('&')[0] || '';
        setLoadError(`Invalid date: "${invalidDate}". Use mm/dd/yyyy.`);
        // Don't set default date for invalid format
        setDefaultDate(null);
        setShowXWordInfoImporter(true);
      } else {
        // No date parameter, load today's puzzle but don't update URL
        try {
          const todayDate = getTodayDateString();
          const newPuzzle = await fetchPuzzleFromXWordInfo(todayDate);
          if (newPuzzle) {
            // preserve numbering / symmetry settings
            newPuzzle.autonumber = puzzle.autonumber;
            newPuzzle.symmetry = puzzle.symmetry;
            // set clock
            clock.setTime(newPuzzle.time || 0);
            setPuzzle(numberPuzzle(newPuzzle));
            // Save the date for future use
            setDefaultDate(dateParam);
            // Don't update URL with today's date so reloading after midnight gets the new day's puzzle
          }
        } catch (error) {
          console.error('Error loading today\'s puzzle:', error);
        }
      }
    };

    loadPuzzleFromUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const savePuzzle = () => storePuzzle({ ...puzzle, time: clock.getTime() });
    (gridIsSolved(puzzle.grid) ? clock.stop : clock.start)();
    savePuzzle();
    window.addEventListener('beforeunload', savePuzzle);
    return () => window.removeEventListener('beforeunload', savePuzzle);
  }, [puzzle, clock]);

  useEffect(() => {
    if (showXWordInfoImporter && modalContentRef.current) {
      modalContentRef.current.focus();
    }
  }, [showXWordInfoImporter]);

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

  const handleImportFromXWordInfo = () => {
    console.log('Current puzzle:', puzzle);
    console.log('Current defaultDate:', defaultDate);
    
    // Always try to get the date from the current puzzle
    if (puzzle.title) {
      const dateMatch = puzzle.title.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (dateMatch) {
        const [_, month, day, year] = dateMatch;
        const extractedDate = `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
        console.log('Extracted date from title:', extractedDate);
        setDefaultDate(extractedDate);
      } else {
        console.log('No date found in title:', puzzle.title);
      }
    } else {
      console.log('No title found in puzzle');
    }
    
    setShowXWordInfoImporter(true);
  };

  const handleXWordInfoPuzzleLoaded = (newPuzzle: XwdPuzzle, loadedDate: string) => {
    // preserve numbering / symmetry settings
    newPuzzle.autonumber = puzzle.autonumber;
    newPuzzle.symmetry = puzzle.symmetry;
    // set clock
    clock.setTime(newPuzzle.time || 0);
    setPuzzle(numberPuzzle(newPuzzle));
    setShowXWordInfoImporter(false);
    // Save the date for future use
    setDefaultDate(loadedDate);
    storePuzzle(newPuzzle);
    
    // Extract date from puzzle if available and update URL
    if (newPuzzle.title) {
      const dateMatch = newPuzzle.title.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (dateMatch) {
        const [_, month, day, year] = dateMatch;
        const formattedDate = `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
        updateUrlWithDate(formattedDate);
      }
    }
    
    // Clear any load errors
    setLoadError(null);
  };

  const handleXWordInfoImportCancel = () => {
    setShowXWordInfoImporter(false);
    setLoadError(null);
  };

  return (
    <div className="puzzle-loader">
      {showXWordInfoImporter && (
        <div className="modal-overlay">
          <div className="modal-content" ref={modalContentRef} tabIndex={0}>
            <XWordInfoImporter 
              onImport={handleXWordInfoPuzzleLoaded} 
              onCancel={handleXWordInfoImportCancel}
              initialError={loadError}
              defaultDate={defaultDate}
            />
          </div>
        </div>
      )}
      
      <Puzzle 
        puzzle={puzzle} 
        setPuzzle={setPuzzle} 
        clock={clock} 
        onDrop={onDrop} 
        onImportFromXWordInfo={handleImportFromXWordInfo}
      />
    </div>
  );
}
