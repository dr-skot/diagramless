import React, { useState, useEffect } from "react";
import { keysWithTrueValues } from "../services/common/utils";
import { observer } from "mobx-react";

function getClasses(cell, cursor) {
  const classes = {
    black: cell.isBlack,
    wrong: cell.isMarkedWrong,
    revealed: cell.wasRevealed,
    fixed: cell.wasRevealed || cell.isVerified,
    cursor: cursor.cell,
    focus: cursor.word,
    related: cursor.related,
    shadow: cursor.shadow,
    noselect: true,
  };
  return keysWithTrueValues(classes).join(" ");
}

function getFontSize(width) {
  // TODO instead of magic constant, derive from CSS: cssFontSize * realCellWidth / cssCellWidth
  return width * (26/36);
}

function getStyle(width) {
  if (!width) return {};
  return {
    width: width,
    height: width,
    minWidth: width,
    fontSize: getFontSize(width),
  };
}

export default function PuzzleCell({ width, cell, cursor, cursorRef, onClick }) {
  const [textSpan, setTextSpan] = useState(null);

  // fit text
  useEffect(() => {
    if (!textSpan) return;
    const boxWidth = width - 2;
    const baseFontSize = getFontSize(width);
    if (textSpan.offsetWidth > boxWidth) {
      const newFontSize = baseFontSize * (boxWidth / textSpan.offsetWidth);
      textSpan.style.fontSize = Math.min(newFontSize, baseFontSize) + "px";
    }
    return () => textSpan.style.fontSize = 'inherit';
  }, [width, textSpan]);

  const { content, number, isBlack, circle } = cell;
  return (
    <td
      className={getClasses(cell, cursor)}
      onClick={onClick}
      style={getStyle(width)}
      ref={cursor.cell ? cursorRef : null}
    >
      <div className="content">
        <span ref={setTextSpan}>{isBlack ? "" : content}</span>
      </div>
      <div className="label">{isBlack ? "" : number}</div>
      {circle ? <div className="circle" /> : ""}
    </td>
  );
}

observer(PuzzleCell);

