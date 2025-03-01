import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { DEFAULT_PUZZLE } from '../model/defaultPuzzle';
import { puzzleFromFile, XwdPuzzle } from '../model/puzzle';
import { tryToParse } from '../utils/utils';
import Clock from '../model/clock';
import { gridIsSolved } from '../model/grid';
import Puzzle from './Puzzle';
import { handleDroppedFile } from '../utils/dom';
import { numberPuzzle } from '../model/numbering';
import XWordInfoImporter from './XWordInfoImporter';

const loadPuzzle = () => tryToParse(localStorage.getItem('xword2') || '', DEFAULT_PUZZLE);

const storePuzzle = (puzzle: XwdPuzzle) => {
  localStorage.setItem('xword2', JSON.stringify(puzzle));
};

export type PuzzleDispatch = Dispatch<SetStateAction<XwdPuzzle>>;

export default function PuzzleLoader() {
  const [puzzle, setPuzzle] = useState<XwdPuzzle>(loadPuzzle());
  const [clock] = useState(new Clock(puzzle.time));
  const [showXWordImporter, setShowXWordImporter] = useState(false);

  useEffect(() => {
    const savePuzzle = () => storePuzzle({ ...puzzle, time: clock.getTime() });
    (gridIsSolved(puzzle.grid) ? clock.stop : clock.start)();
    savePuzzle();
    window.addEventListener('beforeunload', savePuzzle);
    return () => window.removeEventListener('beforeunload', savePuzzle);
  }, [puzzle, clock]);

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

  const handleXWordInfoPuzzleLoaded = (newPuzzle: XwdPuzzle) => {
    // preserve numbering / symmetry settings
    newPuzzle.autonumber = puzzle.autonumber;
    newPuzzle.symmetry = puzzle.symmetry;
    // set clock
    clock.setTime(newPuzzle.time || 0);
    setPuzzle(numberPuzzle(newPuzzle));
    setShowXWordImporter(false);
  };

  return (
    <div>
      {showXWordImporter ? (
        <div className="xwordinfo-modal">
          <div className="xwordinfo-modal-content">
            <button 
              className="close-button" 
              onClick={() => setShowXWordImporter(false)}
            >
              &times;
            </button>
            <XWordInfoImporter onPuzzleLoaded={handleXWordInfoPuzzleLoaded} />
          </div>
          <style jsx>{`
            .xwordinfo-modal {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.5);
              display: flex;
              justify-content: center;
              align-items: center;
              z-index: 1000;
            }
            
            .xwordinfo-modal-content {
              background-color: white;
              padding: 20px;
              border-radius: 5px;
              max-width: 80%;
              max-height: 80%;
              overflow-y: auto;
              position: relative;
            }
            
            .close-button {
              position: absolute;
              top: 10px;
              right: 10px;
              font-size: 24px;
              background: none;
              border: none;
              cursor: pointer;
            }
          `}</style>
        </div>
      ) : (
        <Puzzle 
          puzzle={puzzle} 
          setPuzzle={setPuzzle} 
          clock={clock} 
          onDrop={onDrop} 
          onImportFromXWordInfo={() => setShowXWordImporter(true)}
        />
      )}
    </div>
  );
}
