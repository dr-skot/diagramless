import React from 'react';
import ClueList from './ClueList';
import { XwdPuzzle } from '../model/immutable/puzzle';

interface ClueListsProps {
  puzzle: XwdPuzzle;
  onClueSelect: (clue: any) => void;
}

// TODO simplify: just pass the puzzle to these fools
export default function ClueLists({ puzzle, onClueSelect }: ClueListsProps) {
  return (
    <section className="Layout-clueLists--10_Xl">
      <ClueList direction={'across'} puzzle={puzzle} onSelect={onClueSelect} />
      <ClueList direction={'down'} puzzle={puzzle} onSelect={onClueSelect} />
    </section>
  );
}
