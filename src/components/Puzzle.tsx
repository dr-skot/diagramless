import React, { DragEventHandler, useEffect, useRef, useState } from 'react';
import PuzzleHeader from './PuzzleHeader';
import ClueBarAndBoard from './ClueBarAndBoard';
import ClueLists from './ClueLists';
import PuzzleModal, { PAUSED } from './puzzleModal';
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
}

export default function Puzzle({ puzzle, setPuzzle, clock, onDrop }: PuzzleProps) {
  const [showModal, setShowModal] = useState('');

  console.log('render puzzle');

  // show modal when clock pauses
  useEffect(() => {
    const handlePause = () => setShowModal(PAUSED);
    clock.on('stop', handlePause);
    return () => {
      clock.off('stop', handlePause);
    };
  }, [clock]);

  if (!puzzle) return null;

  return (
    <>
      <div className={showModal === PAUSED ? 'app-obscured--26XpG' : ''}>
        <PuzzleView puzzle={puzzle} setPuzzle={setPuzzle} clock={clock} onDrop={onDrop} />
      </div>
      <PuzzleModal
        reason={showModal}
        onClose={(reason: string) => {
          setShowModal('');
          if (reason === PAUSED) clock.start();
        }}
      />
    </>
  );
}

interface PuzzleViewProps {
  puzzle: XwdPuzzle;
  setPuzzle: PuzzleDispatch;
  clock: Clock;
  onDrop: DragEventHandler;
}

function PuzzleView(props: PuzzleViewProps) {
  const { puzzle, setPuzzle, clock, onDrop } = props;

  const [isEditingRebus, setEditingRebus] = useState(false);
  const [rebusValue, setRebusValue] = useState('');
  const cursorRef = useRef<HTMLDivElement>(null);

  function finishRebus(submit: boolean) {
    if (submit) setPuzzle(changeCurrentCell((cell) => setContent(cell, rebusValue)));
    setEditingRebus(false);
  }

  function startRebus() {
    setRebusValue(currentCell(puzzle).content);
    setEditingRebus(true);
  }

  function toggleRebus() {
    if (!isEditingRebus) startRebus();
    else finishRebus(true);
  }

  return (
    <>
      <PuzzleToolbar clock={clock} puzzle={puzzle} setPuzzle={setPuzzle} onRebus={toggleRebus} />
      <PuzzleHeader title={puzzle.title} author={puzzle.author} />
      <div className="layout-puzzle" onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
        <ClueBarAndBoard puzzle={puzzle} setPuzzle={setPuzzle} cursorRef={cursorRef} />
        <ClueLists puzzle={puzzle} setPuzzle={setPuzzle} />
      </div>
      {isEditingRebus ? (
        <RebusInput
          value={rebusValue}
          setValue={setRebusValue}
          alignWith={cursorRef}
          onFinish={finishRebus}
        />
      ) : (
        <PuzzleKeys setPuzzle={setPuzzle} onRebus={startRebus} />
      )}
    </>
  );
}
