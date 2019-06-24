import React, { Component } from "react";

class ClueList extends Component {
  render() {
    const label = this.props.label,
      clues = [{ number: 1, clue: "What?" }];
    return (
      <div className="clues" id="{label}">
        <h1>{label}</h1>
        <div className="scroller" id={label + "-scroller"}>
          <table>
            <tbody>
              {clues.map(clue => (
                <tr key={clue.number + label}>
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
