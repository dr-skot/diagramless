import React, { useState, useEffect, DragEventHandler, LegacyRef } from 'react';
import PuzzleHeader from './PuzzleHeader';
import ClueBarAndBoard from './ClueBarAndBoard';
import ClueLists from './ClueLists';
import PuzzleModal, { PAUSED } from './puzzleModal';
import PuzzleToolbar from './PuzzleToolbar';
import Clock from '../model/clock';
import { gridIsSolved, XwdCellCallback } from '../model/grid';
import { XwdPuzzle } from '../model/puzzle';

const noOp = () => {};

interface PuzzleProps {
  puzzle: XwdPuzzle;
  onDrop: DragEventHandler;
  onChange: (puzzle: XwdPuzzle) => void;
}

export default function Puzzle({ puzzle, onDrop, onChange }: PuzzleProps) {
  const [clock] = useState(new Clock());
  const [showModal, setShowModal] = useState('');

  console.log('render puzzle', puzzle);

  // reset clock when puzzle changes
  useEffect(() => {
    if (!puzzle) return;
    clock.setTime(puzzle.time || 0);
    if (!gridIsSolved(puzzle.grid)) clock.start();
  }, [clock, puzzle]);

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
        <PuzzleView
          puzzle={puzzle}
          clock={clock}
          cursorRef={noOp}
          rebus={false}
          rebusDivRef={noOp}
          rebusInputRef={noOp}
          onMenuSelect={noOp}
          onCellClick={noOp}
          onClueSelect={noOp}
          onDrop={onDrop}
          onChange={onChange}
        />
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
  clock: Clock;
  cursorRef: LegacyRef<HTMLDivElement>;
  rebus: boolean;
  rebusDivRef: LegacyRef<HTMLDivElement>;
  rebusInputRef: LegacyRef<HTMLInputElement>;
  onDrop: DragEventHandler;
  onCellClick: XwdCellCallback;
  onClueSelect: () => void;
  onChange: (puzzle: XwdPuzzle) => void;
  onMenuSelect: () => void;
}

function PuzzleView(props: PuzzleViewProps) {
  const {
    puzzle,
    clock,
    cursorRef,
    rebus,
    rebusDivRef,
    rebusInputRef,
    onDrop,
    onCellClick,
    onClueSelect,
    onChange,
  } = props;

  return (
    <>
      <PuzzleHeader title={puzzle.title} author={puzzle.author} />
      <PuzzleToolbar clock={clock} puzzle={puzzle} onChange={onChange} />
      <div className="layout-puzzle" onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
        <ClueBarAndBoard puzzle={puzzle} onCellClick={onCellClick} cursorRef={cursorRef} />
        <ClueLists puzzle={puzzle} onClueSelect={onClueSelect} />
      </div>
      <div id="rebus" ref={rebusDivRef}>
        <input ref={rebusInputRef} style={rebus ? {} : { display: 'none' }} />
      </div>
    </>
  );
}
