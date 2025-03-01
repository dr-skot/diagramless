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
import './PuzzleLoader.css';

const loadPuzzle = () => tryToParse(localStorage.getItem('xword2') || '', DEFAULT_PUZZLE);

const storePuzzle = (puzzle: XwdPuzzle) => {
  localStorage.setItem('xword2', JSON.stringify(puzzle));
};

export type PuzzleDispatch = Dispatch<SetStateAction<XwdPuzzle>>;

export default function PuzzleLoader() {
  const [puzzle, setPuzzle] = useState<XwdPuzzle>(loadPuzzle());
  const [clock] = useState(new Clock(puzzle.time));
  const [showXWordInfoImporter, setShowXWordInfoImporter] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

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
    setShowXWordInfoImporter(true);
  };

  const handleXWordInfoPuzzleLoaded = (newPuzzle: XwdPuzzle) => {
    // preserve numbering / symmetry settings
    newPuzzle.autonumber = puzzle.autonumber;
    newPuzzle.symmetry = puzzle.symmetry;
    // set clock
    clock.setTime(newPuzzle.time || 0);
    setPuzzle(numberPuzzle(newPuzzle));
    setShowXWordInfoImporter(false);
    storePuzzle(newPuzzle);
  };

  const handleXWordInfoImportCancel = () => {
    setShowXWordInfoImporter(false);
  };

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="puzzle-loader">
      {showXWordInfoImporter && (
        <div className="modal-overlay">
          <div className="modal-content" ref={modalContentRef} tabIndex={0}>
            <XWordInfoImporter 
              onImport={handleXWordInfoPuzzleLoaded} 
              onCancel={handleXWordInfoImportCancel} 
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
