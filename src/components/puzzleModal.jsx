import React from "react";
import UIfx from "uifx";

import booAudio from "../sounds/doh.mp3";
import yayAudio from "../sounds/tada.mp3";

export const SOLVED = "SOLVED",
  FILLED = "FILLED",
  PAUSED = "PAUSED";

const message = {
  SOLVED: "You're amazing!",
  FILLED:
    "Hm. You filled all the squares, but something's not right somewhere.",
  PAUSED: "Paused..."
};

const sounds = {
  SOLVED: new UIfx({ asset: yayAudio, volume: 0.5 }),
  FILLED: new UIfx({ asset: booAudio, volume: 0.5 })
};

const PuzzleModal = ({ show, onClose }) => {
  const showHideClassName = show ? "modal display-block" : "modal display-none";

  if (sounds[show]) {
    sounds[show].play();
  }
  return (
    <div className={showHideClassName}>
      <section className="modal-main">
        <p>{message[show]}</p>
        <button onClick={() => onClose(show)}>close</button>
      </section>
    </div>
  );
};

export default PuzzleModal;
