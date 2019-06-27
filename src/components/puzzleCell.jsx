import React, { Component } from "react";
import _ from "lodash";

class PuzzleCell extends Component {
  state = {};
  getClasses() {
    const { settings } = this.props;
    return _.keys(_.pickBy(settings)).join(" "); // keys w true values
  }
  render() {
    const { content, number, onClick, settings } = this.props;
    return (
      <td className={this.getClasses()} onClick={onClick}>
        <div className="content">{settings.black ? "" : content}</div>
        <div className="label">{settings.black ? "" : number}</div>
      </td>
    );
  }
}

export default PuzzleCell;
