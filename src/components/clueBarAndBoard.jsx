import React, { Component } from "react";
import ClueBar from "./clueBar";
import PuzzleGrid from "./puzzleGrid";

class ClueBarAndBoard extends Component {
  state = {
    sizes: {}
  };

  componentDidMount() {
    this.computeWidths();
    window.addEventListener("resize", this.computeWidths);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.computeWidths);
  }

  computeWidths = () => {
    const containerWidth = this.container.offsetWidth,
      gridWidth = this.props.grid.width,
      cellWidth = Math.floor((containerWidth - 2) / gridWidth),
      boardWidth = cellWidth * gridWidth + 2;
    this.setState({
      sizes: { gridWidth, cellWidth, boardWidth }
    });
  };

  componentWillUpdate() {
    // TODO: can this be automated with mobx?
    // resize if new puzzle width
    if (
      this.state.sizes &&
      this.state.sizes.gridWidth !== this.props.grid.width
    )
      this.computeWidths();
  }

  render() {
    const { grid } = this.props;
    return (
      <div
        className="layout-cluebar-and-board"
        ref={el => (this.container = el)}
      >
        {this.state.sizes ? (
          <React.Fragment>
            <ClueBar
              clue={this.props.clue}
              width={this.state.sizes.boardWidth}
            />
            <PuzzleGrid
              grid={grid}
              solved={this.props.isSolved}
              onContentChange={this.props.onContentChange}
              relatedCells={this.props.relatedCells}
              cellWidth={this.state.sizes.cellWidth}
              symmetry={this.props.symmetry}
            />
          </React.Fragment>
        ) : (
          ""
        )}
      </div>
    );
  }
}

export default ClueBarAndBoard;
