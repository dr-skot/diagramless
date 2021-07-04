import React from 'react';
import ClueList from './ClueList';
import { XwdPuzzle } from '../model/puzzle';
import { XwdDirection } from '../model/grid';
import { goToWord } from '../model/cursor';
import { PuzzleDispatch } from './PuzzleLoader';

interface ClueListsProps {
  puzzle: XwdPuzzle;
  setPuzzle: PuzzleDispatch;
}

// TODO simplify: just pass the puzzle to these fools
export default function ClueLists({ puzzle, setPuzzle }: ClueListsProps) {
  function onClueSelect(number: string, direction: XwdDirection) {
    setPuzzle(goToWord(number, direction));
  }

  return (
    <section className="Layout-clueLists">
      <ClueList direction={'across'} puzzle={puzzle} onSelect={onClueSelect} />
      <ClueList direction={'down'} puzzle={puzzle} onSelect={onClueSelect} />
    </section>
  );
}
