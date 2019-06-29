import React from "react";
import { ACROSS, DOWN } from "../services/xwdService";
import ClueList from "./clueList";

const ClueLists = props => {
  const puzzle = props.puzzle;
  return (
    <div className="layout-clue-lists">
      <ClueList
        label="across"
        clues={puzzle.data.clues.filter(clue => clue.direction[1])}
        current={puzzle.grid.clueNumber(ACROSS)}
        active={puzzle.directionIs(ACROSS)}
      />
      <ClueList
        label="down"
        clues={puzzle.data.clues.filter(clue => clue.direction[0])}
        current={puzzle.grid.clueNumber(DOWN)}
        active={puzzle.directionIs(DOWN)}
      />
    </div>
  );
};

export default ClueLists;
