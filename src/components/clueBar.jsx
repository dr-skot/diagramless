import React from "react";

const ClueBar = props => {
  const { clue, width } = props;
  return (
    <div className="cluebar" style={{ width }}>
      <span className="cluebar-number">{clue.number}</span>
      <span className="cluebar-text">{clue.text}</span>
    </div>
  );
};

export default ClueBar;
