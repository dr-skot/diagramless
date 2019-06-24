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
          <ClueList label="across" />
          <ClueList label="down" />
        </div>
      </div>
    );
  }
}

export default Puzzle;
