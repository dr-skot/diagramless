import React, { Component } from "react";

class ClueList extends Component {
  getClasses(clue) {
    const { current, active } = this.props;
    if (clue.number + "" === current + "") {
      return active ? "lit" : "lit secondary";
    } else {
      return "";
    }
  }
  render() {
    const { label, clues } = this.props;
    return (
      <div className="clues" id="{label}">
        <h1>{label}</h1>
        <div className="scroller" id={label + "-scroller"}>
          <table>
            <tbody>
              {clues.map(clue => (
                <tr key={clue.number + label} className={this.getClasses(clue)}>
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

export default ClueList;
