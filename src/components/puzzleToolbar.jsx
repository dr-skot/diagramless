import React, { Component } from "react";
import DropMenu from "./dropMenu";
import PuzzleClock from "./puzzleClock";

class PuzzleToolbar extends Component {
  state = {};

  // TODO support clear incomplete
  // TODO support autocheck
  // TODO move this menu outside component and pass as prop
  menu = {
    number: ["now", "continuously"],
    symmetry: ["diagonal", "left/right"],
    clear: ["word", "white squares", "puzzle", "puzzle & timer"],
    reveal: ["square", "word", "puzzle", "diagram"],
    check: ["square", "word", "puzzle"]
  };

  handleDropMenuSelect = (title, item) => {
    console.log("menu item selected:", title, item);
    this.props.onMenuSelect(title, item);
  };

  render() {
    return (
      <div className="Toolbar-wrapper--1S7nZ toolbar-wrapper">
        <ul className="Toolbar-tools--2qUqg">
          <li className="Tool-button--39W4J Tool-tool--Fiz94">
            <button>
              <i className="Icon-settings-gear--18j4O Icon-icon--1RAWC" />
            </button>
          </li>
          <PuzzleClock
            clock={this.props.clock}
            onClockPause={this.props.onClockPause}
          />
          <li className="Tool-button--39W4J Tool-tool--Fiz94 Tool-texty--2w4Br">
            <button>rebus</button>
          </li>
          <div className="Toolbar-expandedMenu--2s4M4">
            {Object.entries(this.menu).map(([title, items]) => (
              <DropMenu
                key={title}
                title={title}
                items={items}
                onSelect={this.handleDropMenuSelect}
              />
            ))}
          </div>
        </ul>
      </div>
    );
  }
}

export default PuzzleToolbar;
