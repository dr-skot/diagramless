import React, { useState, useEffect, LegacyRef } from 'react';
import ClueBar from './ClueBar';
import PuzzleGrid from './PuzzleGrid';
import { currentClue, XwdPuzzle } from '../model/puzzle';
import { XwdCellCallback } from '../model/grid';

interface ClueBarAndBoardProps {
  puzzle: XwdPuzzle;
  onCellClick: XwdCellCallback;
  cursorRef: LegacyRef<HTMLDivElement>;
}
export default function ClueBarAndBoard({ puzzle, onCellClick, cursorRef }: ClueBarAndBoardProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const updateWindowWidth = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', updateWindowWidth);
    return () => window.removeEventListener('resize', updateWindowWidth);
  });

  function computeWidths() {
    if (!container) return null;
    const containerWidth = container.offsetWidth,
      gridWidth = puzzle.width,
      cellWidth = Math.floor((containerWidth - 2) / gridWidth),
      boardWidth = cellWidth * gridWidth + 2;
    return { gridWidth, cellWidth, boardWidth };
  }
  const widths = computeWidths();

  // TODO implement relatedCells
  return (
    <div className="layout-cluebar-and-board" ref={setContainer}>
      {widths && (
        <>
          <ClueBar clue={currentClue(puzzle)} width={widths.boardWidth} />
          <PuzzleGrid
            puzzle={puzzle}
            cellWidth={widths.cellWidth}
            onCellClick={onCellClick}
            cursorRef={cursorRef}
          />
        </>
      )}
    </div>
  );
}
