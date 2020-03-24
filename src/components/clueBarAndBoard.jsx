import React, { Component } from "react";
import ClueBar from "./clueBar";
import PuzzleGrid from "./puzzleGrid";
import { observer } from "mobx-react";

class ClueBarAndBoard extends Component {
  componentDidMount() {
    this.forceUpdate(); // rerender after mount so computedWidths can measure container
    window.addEventListener("resize", this.forceUpdateMan);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.forceUpdateMan);
  }

  // seems to be necessary
  forceUpdateMan = () => {
    this.forceUpdate();
  };

  computedWidths = () => {
    if (!this.container) return null;
    const containerWidth = this.container.offsetWidth,
      gridWidth = this.props.grid.width,
      cellWidth = Math.floor((containerWidth - 2) / gridWidth),
      boardWidth = cellWidth * gridWidth + 2;
    return { gridWidth, cellWidth, boardWidth };
  };

  render() {
    const { grid } = this.props;
    const widths = this.computedWidths();
    return (
      <div
        className="layout-cluebar-and-board"
        ref={el => (this.container = el)}
      >
        {widths ? (
          <React.Fragment>
            <ClueBar clue={this.props.clue} width={widths.boardWidth} />
            <PuzzleGrid
              grid={grid}
              relatedCells={this.props.relatedCells}
              cellWidth={widths.cellWidth}
              onCellClick={this.props.onCellClick}
              cursorRef={this.props.cursorRef}
            />
          </React.Fragment>
        ) : (
          ""
        )}
      </div>
    );
  }
}

observer(ClueBarAndBoard);

export default ClueBarAndBoard;
