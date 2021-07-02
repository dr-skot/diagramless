import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { DOWN, LEFT, RIGHT, UP } from '../services/xwdService';
import { advanceCursorInWord, changeCurrentCell, XwdPuzzle } from '../model/puzzle';
import { addToCursor, currentCell, goToNextWord, toggleDirection } from '../model/cursor';
import { XwdDirection } from '../model/grid';
import { setContent, toggleBlack } from '../model/cell';

// TODO change number[] to vector here
const arrowVectors: Record<string, number[]> = {
  ArrowLeft: LEFT,
  ArrowUp: UP,
  ArrowRight: RIGHT,
  ArrowDown: DOWN,
};

type Vector = [number, number];
const vector = (direction: XwdDirection): Vector => (direction === 'across' ? [0, 1] : [1, 0]);
const backVector = (direction: XwdDirection): Vector =>
  direction === 'across' ? [0, -1] : [-1, 0];

const isPerpendicular = (direction: XwdDirection, vector: number[]) =>
  (direction === 'across' && vector[0]) || (direction === 'down' && vector[1]);

interface PuzzleKeysProps {
  setPuzzle: Dispatch<SetStateAction<XwdPuzzle>>;
}

export default function PuzzleKeys({ setPuzzle }: PuzzleKeysProps) {
  useEffect(() => {
    let editingNumber: XwdPuzzle | null = null;

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
        if (prev === editingNumber) {
          editingNumber = changeCurrentCell((c) => ({ number: c.number.slice(0, -1) }))(prev);
          return editingNumber;
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

      function editNumber(number: string, digit: string, wasEditing: boolean) {
        const newNumber = (wasEditing ? number : '') + digit;
        return newNumber === '0' ? '' : newNumber;
      }

      setPuzzle((prev) => {
        const cell = currentCell(prev);
        if (prev.isAutonumbered || cell.isLocked) return prev;
        else {
          editingNumber = changeCurrentCell((c) => ({
            isBlack: false,
            number: editNumber(c.number, event.key, prev === editingNumber),
          }))(prev);
          return editingNumber;
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
      if (event.metaKey) return;
      if (!(event.key === 'Backspace' || event.key.match(/^\d$/))) editingNumber = null;

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
