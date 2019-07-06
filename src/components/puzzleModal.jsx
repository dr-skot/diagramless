import React from "react";
import UIfx from "uifx";

import booAudio from "../sounds/doh.mp3";
import yayAudio from "../sounds/tada.mp3";

const boo = new UIfx({ asset: booAudio, volume: 0.5 });
const yay = new UIfx({ asset: yayAudio, volume: 0.5 });

const PuzzleModal = ({ show, solved, onClose }) => {
  const showHideClassName = show ? "modal display-block" : "modal display-none";

  if (show) {
    (solved ? yay : boo).play();
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
