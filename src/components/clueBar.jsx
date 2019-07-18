import React from "react";
import { observer } from "mobx-react";

const ClueBar = props => {
  const { clue, width } = props;
  return (
    <div className="cluebar" style={{ width }}>
      <span className="cluebar-number">{clue.number}</span>
      <span className="cluebar-text">{clue.text}</span>
    </div>
  );
};

observer(ClueBar);

export default ClueBar;
