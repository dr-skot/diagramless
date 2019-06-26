import React, { Component } from "react";
import _ from "lodash";
import { ACROSS, DOWN, puzzleFromFileData } from "../services/xwdService";
import PuzzleGrid from "./puzzleGrid";
import ClueList from "./clueList";
import CursoredXwdGrid from "../model/cursoredXwdGrid";
import { observer } from "mobx-react";
import FileDrop from "react-file-drop";

class Puzzle extends Component {
  state = {
    puz: null
  };

  grid = null;

  directionIs(direction) {
    return _.isEqual(direction, this.grid.direction);
  }

  handleDrop = (files, event) => {
    const reader = new FileReader();

    reader.onabort = () => console.log("file reading was aborted");
    reader.onerror = () => console.log("file reading has failed");
    reader.onload = () => {
      // TODO check for integrity of contents & fail gracefully
      const binaryStr = reader.result;
      const puz = puzzleFromFileData(binaryStr);
      console.log({ puz });
      this.grid = new CursoredXwdGrid(puz.height, puz.width);
      //this.grid.setContents(puz.solution);
      //this.grid.setNumbers(puz.numbers);
      this.setState({ puz });
    };

    reader.readAsArrayBuffer(files[0]);
  };

  componentDidUpdate() {
    localStorage.setItem("xword", JSON.stringify(this.state.puz));
  }

  componentDidMount() {
    const puz = JSON.parse(localStorage.getItem("xword"));
    console.log("will mount:", puz);
    // TODO check for integrity of puzzle data & fail gracefully
    if (puz) this.grid = new CursoredXwdGrid(puz.height, puz.width);
    this.setState({ puz });
  }

  render() {
    const styles = {
      border: "1px solid black",
      width: 600,
      color: "black",
      padding: 20
    };
    console.log("puz", this.state.puz, "grid", this.grid);
    if (this.state.puz) {
      console.log("width", this.state.puz.width);
      console.log("solution", this.state.puz.solution);
      console.log("clues", this.state.puz.clues);
    }
    return this.grid && this.state.puz && this.state.puz.clues ? (
      <div className="grid-and-clue-lists">
        <PuzzleGrid grid={this.grid} />
        <div className="clue-lists" onClick={() => this.test()}>
          <ClueList
            label="across"
            clues={this.state.puz.clues.filter(clue => clue.direction[1])}
            current={this.grid.clueNumber(ACROSS)}
            active={_.isEqual(ACROSS, this.grid.direction)}
          />
          <ClueList
            label="down"
            clues={this.state.puz.clues.filter(clue => clue.direction[0])}
            current={this.grid.clueNumber(DOWN)}
            active={_.isEqual(DOWN, this.grid.direction)}
          />
        </div>
      </div>
    ) : (
      <div id="react-file-drop-demo" style={{ styles }}>
        <FileDrop onDrop={this.handleDrop}>Drop some files here!</FileDrop>
      </div>
    );
  }
}

observer(Puzzle);

export default Puzzle;
