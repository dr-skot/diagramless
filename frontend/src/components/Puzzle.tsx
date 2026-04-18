import React, { DragEventHandler, useEffect, useRef, useState } from 'react';
import PuzzleHeader from './PuzzleHeader';
import ClueBarAndBoard from './ClueBarAndBoard';
import ClueLists from './ClueLists';
import PuzzleToolbar from './PuzzleToolbar';
import Clock from '../model/clock';
import { changeCurrentCell, XwdPuzzle } from '../model/puzzle';
import PuzzleKeys from './PuzzleKeys';
import { PuzzleDispatch } from './PuzzleLoader';
import { currentCell } from '../model/cursor';
import { setContent } from '../model/cell';
import { RebusInput } from './RebusInput';

interface PuzzleProps {
  puzzle: XwdPuzzle;
  setPuzzle: PuzzleDispatch;
  clock: Clock;
  onDrop: DragEventHandler;
  onLoadPuzzle?: () => void;
  onPause?: () => void;
  onClearAndRestart?: () => void;
}

export default function Puzzle({ puzzle, setPuzzle, clock, onDrop, onLoadPuzzle, onPause, onClearAndRestart }: PuzzleProps) {
  const [isEditingRebus, setEditingRebus] = useState(false);
  const rebusValue = useRef('');
  const cursorRef = useRef<HTMLDivElement>(null);

  // cancel rebus on any puzzle change
  useEffect(() => {
    setEditingRebus(false);
  }, [puzzle]);

  function finishRebus(submit: boolean) {
    if (submit) setPuzzle(changeCurrentCell((cell) => setContent(cell, rebusValue.current)));
    setEditingRebus(false);
  }

  function startRebus() {
    if (currentCell(puzzle).isLocked) return;
    rebusValue.current = currentCell(puzzle).content;
    setEditingRebus(true);
  }

  function toggleRebus() {
    if (!isEditingRebus) startRebus();
    else finishRebus(true);
  }

  return (
    <>
      <PuzzleToolbar
        clock={clock}
        puzzle={puzzle}
        setPuzzle={setPuzzle}
        onRebus={toggleRebus}
        onImportFromXWordInfo={onLoadPuzzle}
        onPause={onPause}
        onClearAndRestart={onClearAndRestart}
      />
      <PuzzleHeader title={puzzle.title} author={puzzle.author} date={puzzle.date} />
      <div className="layout-puzzle" onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
        <ClueBarAndBoard puzzle={puzzle} setPuzzle={setPuzzle} cursorRef={cursorRef} />
        <ClueLists puzzle={puzzle} setPuzzle={setPuzzle} />
      </div>
      {isEditingRebus ? (
        <RebusInput value={rebusValue} alignWith={cursorRef} onFinish={finishRebus} />
      ) : (
        <PuzzleKeys setPuzzle={setPuzzle} onRebus={startRebus} />
      )}
    </>
  );
}
