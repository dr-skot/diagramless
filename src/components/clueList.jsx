import React, { Component } from "react";
import { observer } from "mobx-react";
import _ from "lodash";
import { ACROSS, DOWN } from "../services/xwdService";

class ClueList extends Component {
  scrollerRef = React.createRef();
  firstClueRef = React.createRef();
  highlightRef = React.createRef();

  // true if this clue is highlighted
  clueIsLit(clue) {
    return clue.number === this.props.current;
  }

  // specifies the appropriate highlighting if any
  getClasses(clue) {
    return (
      "Clue-li--1JoPu" +
      (this.clueIsLit(clue)
        ? this.props.active
          ? " Clue-selected--1ta_-"
          : " Clue-highlighted--3H3do"
        : "") +
      (this.clueIsRelated(clue) ? " Clue-related--3Qr8i" : "")
    );
  }

  clueIsRelated(clue) {
    const result = !!_.find(
      this.props.relatedClues,
      relatedClue =>
        relatedClue.number === clue.number &&
        _.isEqual(relatedClue.direction, this.direction)
    );
    return result;
  }

  // marks the lit clue so we can scroll to it
  getRef(clue, index) {
    return this.clueIsLit(clue)
      ? this.highlightRef
      : index === 0
      ? this.firstClueRef
      : "";
  }

  // scrolls to the lit clue after an update
  componentDidUpdate() {
    const scroller = this.scrollerRef.current,
      highlight = this.highlightRef.current,
      // no first clue ref means first clue is the highlighted clue
      firstClue = this.firstClueRef.current || this.highlightRef.current;
    if (scroller && highlight) {
      scroller.scroll({
        top: highlight.offsetTop - firstClue.offsetTop,
        behavior: "smooth"
      });
    }
  }

  componentDidMount() {
    this.direction = this.props.label.match(/across/i) ? ACROSS : DOWN;
  }

  render() {
    const { label, clues } = this.props;
    return (
      <div className="ClueList-wrapper--3m-kd cluelist-wrapper">
        <h3 className="ClueList-title--1-3oW">{label}</h3>
        <ol className="ClueList-list--2dD5-" ref={this.scrollerRef}>
          {clues.map((clue, index) => (
            <li
              key={clue.number + label}
              ref={this.getRef(clue, index)}
              className={this.getClasses(clue)}
              onClick={() => this.props.onSelect(clue.number, label)}
            >
              <span className="Clue-label--2IdMY">{clue.number}</span>
              <span className="Clue-text--3lZl7">{clue.clue}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }
}

observer(ClueList);

export default ClueList;
