import React, { useState, useEffect, LegacyRef } from 'react';
import { keysWithTrueValues } from '../services/common/utils';
import { observer } from 'mobx-react';
import { isCorrect, XwdCell } from '../model/cell';
import { XwdCellCallback } from '../model/grid';

function getClasses(cell: XwdCell, cursor: CursorSettings) {
  const classes = {
    'puzzle-cell': true,
    noselect: true,
    black: cell.isBlack,
    wrong: cell.wasRevealed && !isCorrect(cell),
    revealed: cell.wasRevealed,
    // TODO clean up this logic
    fixed: cell.wasRevealed || (cell.wasChecked && isCorrect(cell)),
    cursor: cursor.cell,
    focus: cursor.word,
    related: cursor.related,
    shadow: cursor.shadow,
  };
  return keysWithTrueValues(classes).join(' ');
}

function getFontSize(width: number) {
  // TODO instead of magic constant, derive from CSS: cssFontSize * realCellWidth / cssCellWidth
  return width * (26 / 36);
}

function getStyle(width: number) {
  if (!width) return {};
  return {
    width: width,
    height: width,
    minWidth: width,
    fontSize: getFontSize(width),
  };
}

export interface CursorSettings {
  cell: boolean;
  word: boolean;
  related: boolean;
  shadow: boolean;
}

interface PuzzleCellProps {
  width: number;
  cell: XwdCell;
  cursor: CursorSettings;
  cursorRef: LegacyRef<HTMLDivElement>;
  onClick: XwdCellCallback;
}

export default function PuzzleCell({ width, cell, cursor, cursorRef, onClick }: PuzzleCellProps) {
  const [textSpan, setTextSpan] = useState<HTMLSpanElement | null>(null);

  // fit text
  useEffect(() => {
    if (!textSpan) return;
    const boxWidth = width - 2;
    const baseFontSize = getFontSize(width);
    if (textSpan.offsetWidth > boxWidth) {
      const newFontSize = baseFontSize * (boxWidth / textSpan.offsetWidth);
      textSpan.style.fontSize = Math.min(newFontSize, baseFontSize) + 'px';
    }
    return () => {
      textSpan.style.fontSize = 'inherit';
    };
  }, [width, textSpan]);

  const { content, number, isBlack, circle } = cell;
  // TODO implement cell click
  return (
    <div
      className={getClasses(cell, cursor)}
      style={getStyle(width)}
      ref={cursor.cell ? cursorRef : null}
    >
      <div className="content">
        <span ref={setTextSpan}>{isBlack ? '' : content}</span>
      </div>
      <div className="label">{isBlack ? '' : number}</div>
      {circle ? <div className="circle" /> : ''}
    </div>
  );
}

observer(PuzzleCell);
