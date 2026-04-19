import { Dispatch, SetStateAction, useEffect } from 'react';
import { XwdPuzzle } from '../model/puzzle';
import { currentCell, XwdCursor } from '../model/cursor';
import { DOWN, LEFT, RIGHT, UP, Vector } from '../model/navigation';
import { useToast } from '../context/ToastContext';
import {
  handleArrow,
  handleTab,
  handleBackspace,
  handleAlpha,
  handlePeriod,
  handleDigit,
} from '../model/keyActions';

const arrowVectors: Record<string, Vector> = {
  ArrowLeft: LEFT,
  ArrowUp: UP,
  ArrowRight: RIGHT,
  ArrowDown: DOWN,
};

interface PuzzleKeysProps {
  setPuzzle: Dispatch<SetStateAction<XwdPuzzle>>;
  onRebus: () => void;
  diagramRevealed?: boolean;
}

export default function PuzzleKeys({ setPuzzle, onRebus, diagramRevealed }: PuzzleKeysProps) {
  const { showToast } = useToast();

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
    let editingNumber: XwdCursor | null = null;

    const handleArrowKey = (event: KeyboardEvent) => {
      const vector = arrowVectors[event.key];
      if (!vector) return false;
      setPuzzle((prev) => handleArrow(vector)(prev));
      return true;
    };

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return false;
      setPuzzle((prev) => handleTab({ backward: event.shiftKey })(prev));
      return true;
    };

    const handleBackspaceKey = (event: KeyboardEvent) => {
      if (event.key !== 'Backspace') return false;
      setPuzzle((prev) => {
        const wasEditing = prev.cursor === editingNumber;
        if (wasEditing) {
          const newPuzzle = handleBackspace(true)(prev);
          editingNumber = newPuzzle.cursor;
          return newPuzzle;
        }
        const cell = currentCell(prev);
        if (cell.isLocked) {
          showToast("This cell is correct and locked!");
          return prev;
        }
        return handleBackspace(false)(prev);
      });
      return true;
    };

    const handleAlphaKey = (event: KeyboardEvent) => {
      if (!event.key.match(/^[A-Za-z ]$/)) return false;
      const content = event.key.trim().toUpperCase();
      setPuzzle((prev) => {
        const cell = currentCell(prev);
        if (cell.isLocked) {
          showToast("This cell is correct and locked!");
          return prev;
        }
        return handleAlpha(content)(prev);
      });
      return true;
    };

    const handlePeriodKey = (event: KeyboardEvent) => {
      if (event.key !== '.' || diagramRevealed) return false;
      setPuzzle((prev) => handlePeriod(prev));
      return true;
    };

    const handleDigitKey = (event: KeyboardEvent) => {
      if (!event.key.match(/^\d$/)) return false;
      setPuzzle((prev) => {
        const cell = currentCell(prev);
        if (prev.autonumber !== 'off' || cell.isLocked) return prev;
        const newPuzzle = handleDigit(event.key, prev.cursor === editingNumber)(prev);
        editingNumber = newPuzzle.cursor;
        return newPuzzle;
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
      if (event.metaKey || event.ctrlKey) return;
      if (!(event.key === 'Backspace' || event.key.match(/^\d$/))) editingNumber = null;
      keyHandlers.forEach((handler) => {
        if (handler(event)) {
          event.preventDefault();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setPuzzle, showToast]);
  return null;
}
