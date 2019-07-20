import React from "react";
import UIfx from "uifx";

import booAudio from "../sounds/doh.mp3";
import yayAudio from "../sounds/tada.mp3";
import { observer } from "mobx-react";

export const SOLVED = "SOLVED",
  FILLED = "FILLED",
  PAUSED = "PAUSED";

const message = {
  SOLVED: "You're amazing!",
  FILLED: "Hm. Something’s not right somewhere.",
  PAUSED: "Paused..."
};

const buttonText = {
  SOLVED: "I know, thanks",
  FILLED: "Dagnabbit",
  PAUSED: "Resume"
};

const sounds = {
  SOLVED: new UIfx({ asset: yayAudio, volume: 0.5 }),
  FILLED: new UIfx({ asset: booAudio, volume: 0.5 })
};

const PuzzleModal = ({ reason, onClose }) => {
  const showHideClassName = !reason
    ? "display-none"
    : reason === PAUSED
    ? "display-block"
    : "modal-dimmer display-block";

  if (sounds[reason]) {
    sounds[reason].play();
  }
  return (
    <div
      className={
        showHideClassName +
        " ModalWrapper-wrapper--1GgyB ModalWrapper-stretch--19Bif"
      }
    >
      <div
        id="modalWrapper-overlay"
        className={
          reason === PAUSED
            ? ""
            : " ModalWrapper-overlay--3D0UT ModalWrapper-stretch--19Bif"
        }
      />
      <div className="ModalBody-body--3PkKz" tabIndex="-1">
        <article className="ModalBody-content--QYNuF">
          <div id="content-pauseModalBody">{message[reason]}</div>
          <div className="buttons-modalButtonContainer--35RTh">
            <button
              className="buttons-modalButton--1REsR"
              onClick={() => onClose(reason)}
            >
              <div>
                <span>{buttonText[reason]}</span>
              </div>
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};

observer(PuzzleModal);

export default PuzzleModal;
