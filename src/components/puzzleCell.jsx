import React, { Component } from "react";
import { keysWithTrueValues } from "../services/common/utils";
import { observer } from "mobx-react";

class PuzzleCell extends Component {
  state = {};

   componentDidMount() {
     this.fitText();
   }

  componentDidUpdate() {
    this.fitText();
  }

  componentWillUpdate() {
    this.unfitText();
  }

  fitText() {
    const text = this.textSpan;
    const boxWidth = this.props.width - 2;
    const baseFontSize = this.getFontSize();
    if (text.offsetWidth > boxWidth) {
      const newFontSize = baseFontSize * (boxWidth / text.offsetWidth);
      text.style.fontSize = Math.min(newFontSize, baseFontSize) + "px";
    }
  }

  unfitText() {
    this.textSpan.style.fontSize = "inherit";
  }

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

  // TODO move this logic out to grid
  getCursorRef() {
    const { cursor, cursorRef } = this.props;
    return cursor.cell ? cursorRef : null;
  }

  getStyle() {
    const { width } = this.props;
    return width
      ? {
          width: width,
          height: width,
          minWidth: width,
          fontSize: this.getFontSize()
        }
      : {};
  }

  getFontSize() {
    // TODO instead of magic constant, derive from CSS: cssFontSize * realCellWidth / cssCellWidth
    return (26 / 36) * this.props.width;
  }

  render() {
    const { content, number, isBlack, circle } = this.props.cell;
    return (
      <td
        className={this.getClasses()}
        onClick={this.props.onClick}
        style={this.getStyle()}
        ref={this.getCursorRef()}
      >
        <div className="content">
          <span ref={el => (this.textSpan = el)}>{isBlack ? "" : content}</span>
        </div>
        <div className="label">{isBlack ? "" : number}</div>
        {circle ? <div className="circle" /> : ""}
      </td>
    );
  }
}
observer(PuzzleCell);

export default PuzzleCell;
