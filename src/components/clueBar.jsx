import React from "react";

const ClueBar = props => {
  const clue = props.clue;
  return (
    <div className="cluebar">
      <span className="cluebar-number">{clue.number}</span>
      <span className="cluebar-text">{clue.text}</span>
    </div>
  );
};

export default ClueBar;
