import React, { LegacyRef } from 'react';
import { range } from 'lodash';
import PuzzleCell, { CursorSettings } from './PuzzleCell';
import { XwdGrid } from '../model/grid';
import { wordStartsAt } from '../model/word';
import { relatedCells, XwdPuzzle } from '../model/puzzle';
import { currentCell, currentWord, cursorShadowFallsOn, toggleDirection } from '../model/cursor';
import { PuzzleDispatch } from './PuzzleLoader';

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
  setPuzzle: PuzzleDispatch;
  cellWidth: number;
  cursorRef: LegacyRef<HTMLDivElement>;
}

export default function PuzzleGrid({ puzzle, setPuzzle, cellWidth, cursorRef }: PuzzleGridProps) {
  if (!puzzle?.grid.length) return null;
  const grid = puzzle.grid;

  const cursorSettings = (row: number, col: number): CursorSettings => ({
    cell: puzzle.cursor.row === row && puzzle.cursor.col === col,
    word: cellFoundInList(row, col, currentWord(puzzle) || []),
    related: cellFoundInList(row, col, relatedCells(puzzle)),
    shadow: !!currentCell(puzzle).isBlack && cursorShadowFallsOn(puzzle.cursor, row, col),
  });

  const handleCellClick = (row: number, col: number) => {
    setPuzzle((prev: XwdPuzzle) =>
      prev.cursor.row === row && prev.cursor.col === col
        ? { ...prev, cursor: toggleDirection(prev.cursor) }
        : { ...prev, cursor: { ...prev.cursor, row, col } }
    );
  };

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
            onClick={() => handleCellClick(row, col)}
            width={cellWidth - 1}
            cursorRef={cursorRef}
          />
        ))
      )}
    </div>
  );
}
