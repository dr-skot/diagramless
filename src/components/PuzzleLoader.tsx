import React, { useState, useCallback } from 'react';
import Puzzle from './Puzzle';
import { DEFAULT_PUZZLE } from '../model/immutable/defaultPuzzle';
import { puzzleFromFile, XwdPuzzle } from '../model/immutable/puzzle';
import { tryToParse } from '../services/common/utils';

const loadPuzzle = () => tryToParse(localStorage.getItem('xword2') || '', DEFAULT_PUZZLE);

const storePuzzle = (puzzle: XwdPuzzle) => {
  localStorage.setItem('xword2', JSON.stringify(puzzle));
};

const handleDrop = (callback: (buf: ArrayBuffer) => void) => (event: any) => {
  event.preventDefault();
  const transfer = event.dataTransfer;
  const file =
    transfer?.items?.[0].kind === 'file' ? transfer.items[0].getAsFile() : transfer?.files?.[0];

  if (!file) {
    console.error('No file found');
  } else {
    const reader = new FileReader();
    reader.onabort = () => console.error('File reading was aborted');
    reader.onerror = () => console.error('File reading has failed');
    reader.onload = () => callback(reader.result as ArrayBuffer);
    reader.readAsArrayBuffer(file);
  }
};

export default function PuzzleLoader() {
  const [puzzle, setPuzzle] = useState<XwdPuzzle>(loadPuzzle());

  const handleChange = useCallback((puz) => {
    setPuzzle(puz);
    storePuzzle(puz);
  }, []);

  const onDrop = handleDrop((contents) => {
    const newPuzzle = puzzleFromFile(contents);
    if (!newPuzzle) return;
    // preserve settings
    newPuzzle.isAutonumbered = puzzle.isAutonumbered;
    newPuzzle.symmetry = puzzle.symmetry;
    handleChange(newPuzzle);
  });

  return <Puzzle puzzle={puzzle} onDrop={onDrop} onChange={handleChange} />;
}
