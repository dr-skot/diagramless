import React from 'react';
import DropMenu from './DropMenu';
import PuzzleClock from './PuzzleClock';
import {
  autonumber,
  changeCells,
  changeCellsInWord,
  changeCurrentCell,
  setSymmetry,
  toggleAutonumbering,
  XwdPuzzle,
} from '../model/puzzle';
import { puzdata_to_pdf } from '../services/puzzlePdf';
import { gridIsSolved } from '../model/grid';
import { checkCell, clearCell, revealCell, revealCircle, revealMeta } from '../model/cell';
import Clock from '../model/clock';
import { PuzzleDispatch } from './PuzzleLoader';

interface PuzzleToolbarProps {
  clock: Clock;
  puzzle: XwdPuzzle;
  setPuzzle: PuzzleDispatch;
  onRebus: () => void;
}

export default function PuzzleToolbar({ clock, puzzle, setPuzzle, onRebus }: PuzzleToolbarProps) {
  const checked: Record<string, string> = {
    symmetry: puzzle.symmetry as string,
    number: puzzle.isAutonumbered ? 'continuously' : '',
  };

  // TODO support clear incomplete
  // TODO support autocheck
  const menu = {
    number: {
      now: () => setPuzzle(autonumber),
      continuously: () => setPuzzle(toggleAutonumbering),
    },
    symmetry: {
      diagonal: () => setPuzzle(setSymmetry('diagonal')),
      'left-right': () => setPuzzle(setSymmetry('left-right')),
    },
    clear: {
      word: () => setPuzzle(changeCellsInWord(clearCell)),
      'white squares': () => setPuzzle(changeCells(clearCell)((cell) => cell.isBlack)),
      puzzle: () => setPuzzle(changeCells(clearCell)()),
      'puzzle & timer': () => {
        setPuzzle(changeCells(clearCell)());
        clock.reset();
      },
    },
    reveal: {
      square: () => setPuzzle(changeCurrentCell(revealCell)),
      word: () => setPuzzle(changeCellsInWord(revealCell)),
      puzzle: () => setPuzzle(changeCells(revealCell)()),
      diagram: () => setPuzzle(changeCells(revealMeta)()),
      circles: () => setPuzzle(changeCells(revealCircle)()),
    },
    check: {
      square: () => setPuzzle(changeCurrentCell(checkCell)),
      word: () => setPuzzle(changeCellsInWord(checkCell)),
      puzzle: () => setPuzzle(changeCells(checkCell)()),
    },
  };

  function print() {
    puzdata_to_pdf(puzzle);
  }

  function handleRebusButton() {
    alert('rebus!');
  }

  return (
    <div className="Toolbar-wrapper--1S7nZ toolbar-wrapper">
      <ul className="Toolbar-tools--2qUqg">
        <li className="Tool-button--39W4J Tool-tool--Fiz94 Tool-texty--2w4Br">
          <button onClick={print}>Print</button>
        </li>
        <PuzzleClock clock={clock} disabled={gridIsSolved(puzzle.grid)} />
        <li className="Tool-button--39W4J Tool-tool--Fiz94 Tool-texty--2w4Br">
          <button onClick={handleRebusButton}>rebus</button>
        </li>
        <div className="Toolbar-expandedMenu--2s4M4">
          {Object.entries(menu).map(([title, items]) => (
            <DropMenu key={title} title={title} items={items} checked={[checked[title]]} />
          ))}
        </div>
      </ul>
    </div>
  );
}
