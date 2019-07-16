import React, { Component } from "react";
import { keysWithTrueValues } from "../services/common/utils";

class PuzzleCell extends Component {
  state = {};

  getClasses() {
    const { cell, cursor } = this.props;
    const classes = {
      black: cell.isBlack,
      wrong: cell.isMarkedWrong,
      revealed: cell.wasRevealed,
      fixed: cell.wasRevealed || cell.isVerified,
      cursor: cursor.cell,
      focus: cursor.word,
      related: cursor.related,
      shadow: cursor.shadow
    };
    return keysWithTrueValues(classes).join(" ");
  }

  getStyle() {
    const { width } = this.props;
    return {
      width: width,
      height: width,
      minWidth: width,
      fontSize: (width * 26) / 36
    };
  }

  render() {
    const { content, number, isBlack } = this.props.cell;
    return (
      <td
        className={this.getClasses()}
        onClick={this.props.onClick}
        style={this.getStyle()}
      >
        <div className="content">{isBlack ? "" : content}</div>
        <div className="label">{isBlack ? "" : number}</div>
      </td>
    );
  }
}

export default PuzzleCell;
