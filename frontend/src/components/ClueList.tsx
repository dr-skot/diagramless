import React, { useRef, useEffect } from 'react';
import { currentClue, XwdClue, XwdPuzzle, getRelatedClues } from '../model/puzzle';
import { XwdDirection } from '../model/grid';
import { sanitizeHtml } from '../utils/sanitize';

interface ClueListProps {
  puzzle: XwdPuzzle;
  direction: XwdDirection;
  onSelect: (number: string, direction: XwdDirection) => void;
}

export default function ClueList({ puzzle, direction, onSelect }: ClueListProps) {
  const label = direction;
  const clues = puzzle.clues.filter((clue) => clue.direction === direction);
  const current = currentClue(puzzle, direction);
  const active = puzzle.cursor.direction === direction;
  const relatedClues = getRelatedClues(puzzle);

  const scrollerRef = useRef<HTMLOListElement>(null);
  const firstClueRef = useRef<HTMLLIElement>(null);
  const highlightRef = useRef<HTMLLIElement>(null);

  const clueIsLit = (clue: XwdClue) => clue.number === current?.number;

  function clueIsRelated(clue: XwdClue) {
    return relatedClues.some(
      (relatedClue) =>
        relatedClue.number === clue.number && relatedClue.direction === clue.direction
    );
  }

  // marks the lit clue so we can scroll to it
  function getRef(clue: XwdClue, index: number) {
    return clueIsLit(clue) ? highlightRef : index === 0 ? firstClueRef : undefined;
  }

  // specifies the appropriate highlighting if any
  function getClasses(clue: XwdClue) {
    return (
      'Clue-li' +
      (clueIsLit(clue) ? (active ? ' Clue-selected' : ' Clue-highlighted') : '') +
      (clueIsRelated(clue) ? ' Clue-related' : '')
    );
  }

  useEffect(() => {
    const scroller = scrollerRef.current,
      highlight = highlightRef.current,
      // no first clue ref means first clue is the highlighted clue
      firstClue = firstClueRef.current || highlightRef.current;
    if (scroller && highlight) {
      scroller.scroll({
        top: highlight.offsetTop - (firstClue?.offsetTop || 0),
        behavior: 'smooth',
      });
    }
  });

  return (
    <div className="ClueList-wrapper cluelist-wrapper">
      <h3 className="ClueList-title">{label}</h3>
      <ol className="ClueList-list" ref={scrollerRef}>
        {clues.map((clue, index) => (
          <li
            key={`${clue.number}${direction}`}
            ref={getRef(clue, index)}
            className={getClasses(clue)}
            onClick={() => onSelect(clue.number, direction)}
          >
            <span className="Clue-label">{clue.number}</span>
            <span 
              className="Clue-text" 
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(clue.text) }}
            ></span>
          </li>
        ))}
      </ol>
    </div>
  );
}
