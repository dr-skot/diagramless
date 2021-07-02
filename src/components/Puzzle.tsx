import React, {
  useState,
  useEffect,
  DragEventHandler,
  LegacyRef,
  Dispatch,
  SetStateAction,
} from 'react';
import PuzzleHeader from './PuzzleHeader';
import ClueBarAndBoard from './ClueBarAndBoard';
import ClueLists from './ClueLists';
import PuzzleModal, { PAUSED } from './puzzleModal';
import PuzzleToolbar from './PuzzleToolbar';
import Clock from '../model/clock';
import { gridIsSolved, XwdCellCallback } from '../model/grid';
import { XwdPuzzle } from '../model/puzzle';
import PuzzleKeys from './PuzzleKeys';

const noOp = () => {};

interface PuzzleProps {
  puzzle: XwdPuzzle;
  setPuzzle: Dispatch<SetStateAction<XwdPuzzle>>;
  onDrop: DragEventHandler;
}

export default function Puzzle({ puzzle, setPuzzle, onDrop }: PuzzleProps) {
  const [clock] = useState(new Clock());
  const [showModal, setShowModal] = useState('');

  console.log('render puzzle');

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
      <PuzzleKeys setPuzzle={setPuzzle} />
      <div className={showModal === PAUSED ? 'app-obscured--26XpG' : ''}>
        <PuzzleView
          puzzle={puzzle}
          setPuzzle={setPuzzle}
          clock={clock}
          cursorRef={noOp}
          rebus={false}
          rebusDivRef={noOp}
          rebusInputRef={noOp}
          onMenuSelect={noOp}
          onCellClick={noOp}
          onClueSelect={noOp}
          onDrop={onDrop}
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
  setPuzzle: Dispatch<SetStateAction<XwdPuzzle>>;
  clock: Clock;
  cursorRef: LegacyRef<HTMLDivElement>;
  rebus: boolean;
  rebusDivRef: LegacyRef<HTMLDivElement>;
  rebusInputRef: LegacyRef<HTMLInputElement>;
  onDrop: DragEventHandler;
  onCellClick: XwdCellCallback;
  onClueSelect: () => void;
  onMenuSelect: () => void;
}

function PuzzleView(props: PuzzleViewProps) {
  const {
    puzzle,
    setPuzzle,
    clock,
    cursorRef,
    rebus,
    rebusDivRef,
    rebusInputRef,
    onDrop,
    onCellClick,
    onClueSelect,
  } = props;

  return (
    <>
      <PuzzleToolbar clock={clock} puzzle={puzzle} setPuzzle={setPuzzle} />
      <PuzzleHeader title={puzzle.title} author={puzzle.author} />
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