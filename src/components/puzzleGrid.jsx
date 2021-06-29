import React from "react";
import { range } from 'lodash';
import { observer } from "mobx-react";
import PuzzleCell from "./puzzleCell";

function cellFoundInList(row, col, list) {
  return list?.find(([i, j]) => i === row && j === col);
}

function getCell(grid, row, col) {
  const cell = grid.cell(row, col);
  // only show number at start of word
  return !cell.number || grid.wordStartsAt(row, col)
    ? cell
    : { ...cell, number: "" };
}

export default function PuzzleGrid({ grid, cellWidth, cursorRef, relatedCells, onCellClick }) {
  console.debug("render puzzleGrid");
  if (grid.length === 0) return null;

  const cursorSettings = (row, col) => ({
      cell: grid.cursorIsAt(row, col),
      word: cellFoundInList(row, col, grid.word),
      related: cellFoundInList(row, col, relatedCells),
      shadow: grid.currentCell.isBlack && grid.cursorShadowFallsOn(row, col),
    });

  return (
      <div className="grid2" style={{
        width: `${cellWidth * grid.width + 1}px`,
        gridTemplateColumns: `repeat(${grid.width}, ${cellWidth - 1}px)`,
        gridTemplateRows: `repeat(${grid.height}, ${cellWidth - 1}px)`,
      }}>
          {range(0, grid.height).map(row => (
              range(0, grid.width).map(col => (
                <PuzzleCell
                  key={`cell ${row}, ${col}`}
                  cell={getCell(grid, row, col)}
                  cursor={cursorSettings(row, col)}
                  onClick={event => onCellClick(row, col, event)}
                  width={cellWidth - 1}
                  cursorRef={cursorRef}
                />
              ))
          ))}
    </div>
  );
}

observer(PuzzleGrid);
