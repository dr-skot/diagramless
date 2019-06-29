import React, { Component } from "react";
import { observer } from "mobx-react-lite";

class ClueList extends Component {
  scrollerRef = React.createRef();
  highlightRef = React.createRef();

  // true if this clue is highlighted
  clueIsLit(clue) {
    return clue.number + "" === this.props.current + "";
  }

  // specifies the appropriate highlighting if any
  getClasses(clue) {
    return (
      "clue-list-item" +
      (this.clueIsLit(clue)
        ? this.props.active
          ? " clue-selected"
          : " clue-highlighted"
        : "")
    );
  }

  // marks the lit clue so we can scroll to it
  getRef(clue) {
    return this.clueIsLit(clue) ? this.highlightRef : "";
  }

  // scrolls to the lit clue after an update
  componentDidUpdate() {
    if (this.scrollerRef.current && this.highlightRef.current) {
      console.log("top", this.highlightRef.current.offsetTop);
      this.scrollerRef.current.scrollTop =
        this.highlightRef.current.offsetTop - 60; // TODO: why this 60?
    }
  }

  render() {
    const { label, clues } = this.props;
    return (
      <div className="clue-list-wrapper">
        <h3 className="clue-list-title">{label}</h3>
        <ol className="clue-list-list" ref={this.scrollerRef}>
          {clues.map(clue => (
            <li
              key={clue.number + label}
              ref={this.getRef(clue)}
              className={this.getClasses(clue)}
            >
              <span className="clue-number">{clue.number}</span>
              <span className="clue-text">{clue.clue}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }
}

observer(ClueList);

export default ClueList;
