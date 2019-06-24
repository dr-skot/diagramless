import React, { Component } from "react";
import PuzzleGrid from "./puzzleGrid";
import ClueList from "./clueList";

class Puzzle extends Component {
  state = {};
  render() {
    return (
      <div className="grid-and-clue-lists">
        <PuzzleGrid />
        <div class="clue-lists">
          <ClueList
            label="across"
            clues={[
              { number: 1, clue: "Your mama." },
              { number: 2, clue: "Leave her out of it." }
            ]}
            current="1"
            active="true"
          />
          <ClueList
            label="down"
            clues={[{ number: 1, clue: "And your sister too." }]}
            current="1"
            active=""
          />
        </div>
      </div>
    );
  }
}

export default Puzzle;
