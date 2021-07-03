import { Dispatch, SetStateAction, useEffect } from 'react';
import { DOWN, LEFT, RIGHT, UP } from '../services/xwdService';
import { advanceCursorInWord, changeCurrentCell, XwdPuzzle } from '../model/puzzle';
import {
  addToCursor,
  currentCell,
  goToNextWord,
  toggleDirection,
  XwdCursor,
} from '../model/cursor';
import { setContent, toggleBlack } from '../model/cell';
import { backVector, isPerpendicular, vector } from '../model/direction';

// TODO change number[] to vector here
const arrowVectors: Record<string, number[]> = {
  ArrowLeft: LEFT,
  ArrowUp: UP,
  ArrowRight: RIGHT,
  ArrowDown: DOWN,
};

interface PuzzleKeysProps {
  setPuzzle: Dispatch<SetStateAction<XwdPuzzle>>;
  onRebus: () => void;
}

export default function PuzzleKeys({ setPuzzle, onRebus }: PuzzleKeysProps) {
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onRebus();
    };
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [onRebus]);

  useEffect(() => {
    // the cursor if we're editing the cell number; otherwise null
    let editingNumber: XwdCursor | null = null;

    const handleArrowKey = (event: KeyboardEvent) => {
      const vector = arrowVectors[event.key];
      if (!vector) return false;
      setPuzzle((prev) =>
        isPerpendicular(prev.cursor.direction, vector)
          ? { ...prev, cursor: toggleDirection(prev.cursor) }
          : addToCursor(prev, vector[0], vector[1])
      );
      return true;
    };

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return false;
      setPuzzle((prev) =>
        goToNextWord(prev, {
          eitherDirection: event.altKey,
          backward: event.shiftKey,
          skipFilled: true,
        })
      );
      return true;
    };

    const handleBackspaceKey = (event: KeyboardEvent) => {
      if (event.key !== 'Backspace') return false;
      setPuzzle((prev) => {
        const cell = currentCell(prev);
        if (prev.cursor === editingNumber) {
          const newPuzzle = changeCurrentCell((c) => ({ number: c.number.slice(0, -1) }))(prev);
          editingNumber = newPuzzle.cursor;
          return newPuzzle;
        } else if (cell.content && !cell.isBlack && !cell.isLocked) {
          return changeCurrentCell(() => ({ content: '' }))(prev);
        } else {
          return addToCursor(prev, ...backVector(prev.cursor.direction));
        }
      });
      return true;
    };

    const handleAlphaKey = (event: KeyboardEvent) => {
      if (!event.key.match(/^[A-Za-z ]$/)) return false;
      const content = event.key.trim().toUpperCase(); // space bar sets content to ''
      setPuzzle((prev) => {
        const cell = currentCell(prev);
        if (cell.isLocked) return prev;
        // TODO curry setContent & advanceCursorInWord to make this read better
        else
          return advanceCursorInWord(
            changeCurrentCell((c) => setContent(c, content))(prev),
            !cell.content // if cell was empty, find next empty cell
          );
      });
      return true;
    };

    const handlePeriodKey = (event: KeyboardEvent) => {
      if (event.key !== '.') return false;
      setPuzzle((prev) => {
        const cell = currentCell(prev);
        if (cell.isLocked) return prev;
        // TODO curry addToCursor
        else
          return addToCursor(
            changeCurrentCell(toggleBlack)(prev),
            ...vector(prev.cursor.direction)
          );
      });
      return true;
    };

    const handleDigitKey = (event: KeyboardEvent) => {
      if (!event.key.match(/^\d$/)) return false;

      // adds digit if we were already editing, starts over if not; '0' becomes empty string
      function editNumber(number: string, digit: string, wasEditing: boolean) {
        const newNumber = (wasEditing ? number : '') + digit;
        return newNumber === '0' ? '' : newNumber;
      }

      setPuzzle((prev) => {
        const cell = currentCell(prev);
        if (prev.isAutonumbered || cell.isLocked) return prev;
        else {
          // editingNumber saves the puzzle cursor each time we edit
          // so if prev.cursor === editingNumber, continue editing; otherwise start over
          const newPuzzle = changeCurrentCell({
            isBlack: false,
            number: editNumber(cell.number, event.key, prev.cursor === editingNumber),
          })(prev);
          editingNumber = newPuzzle.cursor;
          return newPuzzle;
        }
      });
      return true;
    };

    const keyHandlers = [
      handleArrowKey,
      handleTabKey,
      handleBackspaceKey,
      handleAlphaKey,
      handlePeriodKey,
      handleDigitKey,
    ];

    const handleKeyDown = (event: KeyboardEvent) => {
      // ignore command-key combinations
      if (event.metaKey || event.ctrlKey) return;

      // clear editingNumber on any key that doesn't edit the number
      if (!(event.key === 'Backspace' || event.key.match(/^\d$/))) editingNumber = null;

      // try each handler; if one responds, prevent default
      keyHandlers.forEach((handler) => {
        if (handler(event)) event.preventDefault();
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setPuzzle]);
  return null;
}
