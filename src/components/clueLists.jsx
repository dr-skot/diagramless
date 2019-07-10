import React from "react";
import { ACROSS, DOWN } from "../services/xwdService";
import ClueList from "./clueList";

// TODO simplify: just pass the puzzle to these fools
const ClueLists = props => {
  const puzzle = props.puzzle;
  return (
    <section className="Layout-clueLists--10_Xl">
      <ClueList
        label="across"
        clues={puzzle.data.clues.filter(clue => clue.direction[1])}
        current={puzzle.grid.clueNumber(ACROSS)}
        relatedClues={puzzle.relatedClues}
        active={puzzle.directionIs(ACROSS)}
        onSelect={props.onClueSelect}
      />
      <ClueList
        label="down"
        clues={puzzle.data.clues.filter(clue => clue.direction[0])}
        current={puzzle.grid.clueNumber(DOWN)}
        relatedClues={puzzle.relatedClues}
        active={puzzle.directionIs(DOWN)}
        onSelect={props.onClueSelect}
      />
    </section>
  );
};

export default ClueLists;
