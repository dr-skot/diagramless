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
    return this.clueIsLit(clue)
      ? this.props.active
        ? "lit"
        : "lit secondary"
      : "";
  }

  // marks the lit clue so we can scroll to it
  getRef(clue) {
    return this.clueIsLit(clue) ? this.highlightRef : "";
  }

  // scrolls to the lit clue after an update
  componentDidUpdate() {
    if (this.scrollerRef.current && this.highlightRef.current) {
      this.scrollerRef.current.scrollTop = this.highlightRef.current.offsetTop;
    }
  }

  render() {
    const { label, clues } = this.props;
    return (
      <div className="clues" id="{label}">
        <h1>{label}</h1>
        <div
          className="scroller"
          ref={this.scrollerRef}
          id={label + "-scroller"}
        >
          <table>
            <tbody>
              {clues.map(clue => (
                <tr
                  key={clue.number + label}
                  ref={this.getRef(clue)}
                  className={this.getClasses(clue)}
                >
                  <td className="marker" />
                  <td className="number">{clue.number}</td>
                  <td className="clue">{clue.clue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

observer(ClueList);

export default ClueList;
