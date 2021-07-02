import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { DOWN, LEFT, RIGHT, UP } from '../services/xwdService';
import { advanceCursorInWord, changeCurrentCell, XwdPuzzle } from '../model/puzzle';
import { addToCursor, currentCell, goToNextWord, toggleDirection } from '../model/cursor';
import { XwdDirection } from '../model/grid';
import { setContent, toggleBlack } from '../model/cell';

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
  /*
  const handlePeriodKey = (event) => {
    if (keyMatch(event, 190) && this.puzzle && !this.puzzle.isSolved) {
      this.toggleBlack();
      this.advanceCursor();
      return true;
    }
  };

  const handleAlphaKey = (event) => {
    if (
      (keyMatch(event, [58, 90]) || keyMatch(event, 32)) &&
      this.puzzle &&
      !this.puzzle.isSolved
    ) {
      this.handleAlpha(String.fromCharCode(event.keyCode));
      return true;
    }
  };

  const handleDigitKey = (event) => {
    if (
      keyMatch(event, [48, 57]) &&
      !this.puzzle.grid.autonumbering &&
      this.puzzle &&
      !this.puzzle.isSolved
    ) {
      this.handleDigit(String.fromCharCode(event.keyCode));
      return true;
    }
  };

  const handleBackspaceKey = (event) => {
    if (keyMatch(event, 8) && this.puzzle && !this.puzzle.isSolved) {
      this.handleBackspace();
      return true;
    }
  };

  const keyHandlers = [
    handleArrowKey,
    handleTabKey,
    handleBackspaceKey,
    handleAlphaKey,
    handleDigitKey,
    handlePeriodKey,
  ];

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.metaKey) return;
    //if (this.handleRebus(event)) return;
    //if (this.state.showModal) return;

    keyHandlers.forEach((handler) => {
      if (handler(event)) event.preventDefault();
    });
  };

  function advanceCursor() {
    this.moveCursor(...this.puzzle.grid.direction);
  }

  function isPerpendicular(direction) {
    const [i, j] = direction;
    const [down, across] = this.puzzle.grid.direction;
    return (across && i) || (down && j); // && !(i && j)
  }

  function handleTab(options = {}) {
    options.skipFilled = true;
    this.actionTracker.recordAction(CHANGE_CURSOR, () => this.puzzle.grid.goToNextWord(options));
  }

  function isEditingNumber() {
    return this.actionTracker.lastAction.name === CHANGE_NUMBER;
  }

  function handleDigit(digit) {
    this.actionTracker.recordAction(CHANGE_NUMBER, () => {
      const cell = this.puzzle.grid.currentCell;
      cell.isBlack = false; // come out of black if edit number
      cell.number = (this.isEditingNumber() ? cell.number : '') + digit;
      if (cell.number === '0') cell.number = ''; // delete if 0
    });
  }

  function handleAlpha(a) {
    const grid = this.puzzle.grid;
    const cellIsEmpty = (pos) => !grid.cell(...pos).content;

    const cell = grid.currentCell;
    if (cell.isVerified || cell.wasRevealed) return; // TODO advance cursor?

    if (grid.currentCell.isBlack) this.toggleBlack();

    const cellWasEmpty = cellIsEmpty(grid.cursor);

    this.actionTracker.setContent(a.trim());

    // advanceCursor(cursorPolicy[cellWasEmpty ? TYPE_IN_EMPTY_CELL : TYPE_IN_FULL_CELL]);

    // move to next cell in word
    const word = grid.word;
    if (!word) return; // TODO is this a copout?
    const currentIndex = word.findIndex((pos) => _.isEqual(pos, grid.cursor));
    let nextCellIdx = nextOrLast(word, currentIndex);

    // if we just filled an empty cell, skip to the next empty cell, with wrap around
    if (cellWasEmpty) {
      const nextEmptyCellIdx = wrapFindIndex(word, nextCellIdx, cellIsEmpty);
      if (nextEmptyCellIdx > -1) nextCellIdx = nextEmptyCellIdx;
    }

    const newCursor = word[nextCellIdx];
    this.actionTracker.setCursor(...newCursor);

    this.handleContentChange();
  }

  function toggleBlack() {
    const cell = this.puzzle.grid.currentCell;
    if (cell.isVerified) return;
    this.actionTracker.recordAction(CHANGE_BLACK, () => {
      cell.isBlack = !cell.isBlack;
      cell.isMarkedWrong = false; // TODO handle this on model
    });
  }
 */

  useEffect(() => {
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
      const isEditingNumber = () => false;
      setPuzzle((prev) => {
        const cell = currentCell(prev);
        if (isEditingNumber()) {
          return cell.number
            ? changeCurrentCell((c) => ({ ...c, number: c.number.slice(0, -1) }))(prev)
            : prev;
        } else if (!cell.content) {
          return addToCursor(prev, ...backVector(prev.cursor.direction));
        } else if (!cell.wasRevealed) {
          // TODO: reinstate isVerified
          return changeCurrentCell((c) => ({ ...c, content: '' }))(prev);
        } else {
          return prev;
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

    const keyHandlers = [
      handleArrowKey,
      handleTabKey,
      handleBackspaceKey,
      handleAlphaKey,
      handlePeriodKey,
      //handleDigitKey,
    ];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey) return;
      //if (this.handleRebus(event)) return;
      //if (this.state.showModal) return;

      keyHandlers.forEach((handler) => {
        if (handler(event)) event.preventDefault();
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  return null;
}
