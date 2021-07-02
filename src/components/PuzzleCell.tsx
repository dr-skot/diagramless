import React, { useState, useEffect, LegacyRef, MouseEventHandler } from 'react';
import { keysWithTrueValues } from '../services/common/utils';
import { cellIsCorrect, XwdCell } from '../model/cell';

function getClasses(cell: XwdCell, cursor: CursorSettings) {
  const classes = {
    'puzzle-cell': true,
    noselect: true,
    black: cell.isBlack,
    wrong: cell.isMarkedWrong,
    revealed: cell.wasRevealed,
    fixed: cell.isLocked,
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
  onClick: MouseEventHandler;
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
      onClick={onClick}
    >
      <div className="content">
        <span ref={setTextSpan}>{isBlack ? '' : content}</span>
      </div>
      <div className="label">{isBlack ? '' : number}</div>
      {circle ? <div className="circle" /> : ''}
    </div>
  );
}
