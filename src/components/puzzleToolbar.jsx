import React, { Component } from "react";
import DropMenu from "./dropMenu";

class PuzzleToolbar extends Component {
  state = {};

  menu = {
    clear: ["incomplete", "word", "puzzle", "puzzle & timer"],
    reveal: ["square", "word", "puzzle"],
    check: ["autocheck", "square", "word", "puzzle"]
  };

  handleDropMenuSelect = (title, item) => {
    console.log("menu item selected:", title, item);
    this.props.onMenuSelect(title, item);
  };

  render() {
    return (
      <div className="Toolbar-wrapper--1S7nZ">
        <ul className="Toolbar-tools--2qUqg">
          <li className="Tool-button--39W4J Tool-tool--Fiz94">
            <button>
              <i className="Icon-settings-gear--18j4O Icon-icon--1RAWC" />
            </button>
          </li>
          <li className="Timer-button--Jg5pv Tool-tool--Fiz94">
            <button>
              <div className="timer-count">0:00</div>
            </button>
          </li>
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
