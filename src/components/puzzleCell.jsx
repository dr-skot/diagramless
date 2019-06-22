import React, { Component } from "react";
import _ from "lodash";

class PuzzleCell extends Component {
  state = {};
  getClasses() {
    const { settings } = this.props;
    return _.keys(_.pickBy(settings)).join(" "); // keys w true values
  }
  render() {
    const { content, number, onClick } = this.props;
    return (
      <td className={this.getClasses()} onClick={onClick}>
        <div className="content">{content}</div>
        <div className="label">{number}</div>
      </td>
    );
  }
}

export default PuzzleCell;
