import React from 'react';
import DropMenu from './DropMenu';
import PuzzleClock from './PuzzleClock';
import {
  changeCells,
  changeCellsInWord,
  changeCurrentCell,
  setAutonumber,
  setSymmetry,
  XwdPuzzle,
} from '../model/puzzle';
import { puzzleToPdf } from '../services/puzzlePdf';
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
    numbering: puzzle.autonumber as string,
  };

  // TODO support clear incomplete
  // TODO support autocheck
  const menu = {
    numbering: {
      off: () => setPuzzle(setAutonumber('off')),
      'from top': () => setPuzzle(setAutonumber('from top')),
      'from bottom': () => setPuzzle(setAutonumber('from bottom')),
      'from both ends': () => setPuzzle(setAutonumber('from both ends')),
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
    puzzleToPdf(puzzle);
  }

  return (
    <div className="Toolbar-wrapper toolbar-wrapper">
      <ul className="Toolbar-tools">
        <li className="Tool-button Tool-tool Tool-texty">
          <button onClick={print}>Print</button>
        </li>
        <PuzzleClock clock={clock} disabled={gridIsSolved(puzzle.grid)} />
        <li className="Tool-button Tool-tool Tool-texty">
          <button onClick={onRebus}>rebus</button>
        </li>
        <div className="Toolbar-expandedMenu">
          {Object.entries(menu).map(([title, items]) => (
            <DropMenu key={title} title={title} items={items} checked={[checked[title]]} />
          ))}
        </div>
      </ul>
    </div>
  );
}
