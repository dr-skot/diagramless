import React from "react";
import UIfx from "uifx";

import failAudio from "../sounds/doh.mp3";
import successAudio from "../sounds/tada.mp3";

const fail = new UIfx({ asset: failAudio });
const success = new UIfx({ asset: successAudio });

// playback
const PuzzleModal = ({ show, solved, onClose }) => {
  const showHideClassName = show ? "modal display-block" : "modal display-none";

  if (show) {
    (solved ? success : fail).play();
  }
  return (
    <div className={showHideClassName}>
      <section className="modal-main">
        <p>{solved ? "You did it!" : "Something's wrong!"}</p>
        <button onClick={onClose}>close</button>
      </section>
    </div>
  );
};

export default PuzzleModal;
