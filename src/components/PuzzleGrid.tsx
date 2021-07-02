import React, { LegacyRef } from 'react';
import { range } from 'lodash';
import PuzzleCell, { CursorSettings } from './PuzzleCell';
import { XwdCellCallback, XwdGrid } from '../model/immutable/grid';
import { wordStartsAt } from '../model/immutable/word';
import { XwdPuzzle } from '../model/immutable/puzzle';
import { currentCell, currentWord, cursorShadowFallsOn } from '../model/immutable/cursor';

function cellFoundInList(row: number, col: number, list: [number, number][]) {
  return list && list.some(([i, j]) => i === row && j === col);
}

function getCell(grid: XwdGrid, row: number, col: number) {
  const cell = grid[row][col];
  // only show number at start of word
  return !cell.number || wordStartsAt(grid, row, col) ? cell : { ...cell, number: '' };
}

interface PuzzleGridProps {
  puzzle: XwdPuzzle;
  cellWidth: number;
  onCellClick: XwdCellCallback;
  cursorRef: LegacyRef<HTMLDivElement>;
}

export default function PuzzleGrid({ puzzle, cellWidth, cursorRef, onCellClick }: PuzzleGridProps) {
  console.debug('render puzzleGrid');
  if (!puzzle?.grid.length) return null;
  const grid = puzzle.grid;

  const cursorSettings = (row: number, col: number): CursorSettings => ({
    cell: puzzle.cursor.row === row && puzzle.cursor.col === col,
    word: cellFoundInList(row, col, currentWord(puzzle) || []),
    related: cellFoundInList(row, col, []), // TODO implement related
    shadow: !!currentCell(puzzle).isBlack && cursorShadowFallsOn(puzzle.cursor, row, col),
  });

  // TODO support cell click

  return (
    <div
      className="grid"
      style={{
        width: `${cellWidth * puzzle.width + 1}px`,
        gridTemplateColumns: `repeat(${puzzle.width}, ${cellWidth - 1}px)`,
        gridTemplateRows: `repeat(${puzzle.height}, ${cellWidth - 1}px)`,
      }}
    >
      {range(0, puzzle.height).map((row) =>
        range(0, puzzle.width).map((col) => (
          <PuzzleCell
            key={`cell ${row}, ${col}`}
            cell={getCell(grid, row, col)}
            cursor={cursorSettings(row, col)}
            onClick={(event) => {}}
            width={cellWidth - 1}
            cursorRef={cursorRef}
          />
        ))
      )}
    </div>
  );
}
