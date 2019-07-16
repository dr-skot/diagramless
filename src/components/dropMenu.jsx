import React, { Component } from "react";

class DropMenu extends Component {
  state = { showing: false };

  show = () => {
    document.addEventListener("click", this.hide);
    this.setState({ showing: true });
  };

  hide = () => {
    document.removeEventListener("click", this.hide);
    this.setState({ showing: false });
  };

  showHide = () => {
    (this.state.showing ? this.hide : this.show)();
  };

  getClasses = label => {
    const checkmarks = this.props.checkmarks || [];
    return (
      "HelpMenu-item--1xl0_" +
      (checkmarks.indexOf(label) > -1 ? " HelpMenu-checked--38XRQ" : "")
    );
  };

  render() {
    const { title, items } = this.props;
    const { showing } = this.state;
    return (
      <li className="Tool-button--39W4J Tool-tool--Fiz94 Tool-texty--2w4Br">
        <button onClick={this.showHide}>{title}</button>
        <ul
          className="HelpMenu-menu--1Z_OA"
          style={{ visibility: showing ? "visible" : "hidden" }} // TODO do it with className
        >
          {items.map(label => (
            <li
              key={["drop-menu", title, label].join(" ")}
              className={this.getClasses(label)}
              style={{ display: "list-item", textTransform: "capitalize" }} // TODO move this to css
            >
              <button
                onClick={event => this.props.onSelect(title, label, event)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </li>
    );
  }
}

export default DropMenu;
