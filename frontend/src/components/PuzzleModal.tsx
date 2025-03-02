import React, { useEffect } from 'react';
import UIfx from 'uifx';

export type ModalReason = 'SOLVED' | 'FILLED' | 'PAUSED';

const message = {
  SOLVED: "You're amazing!",
  FILLED: 'Hm. Something’s not right somewhere.',
  PAUSED: 'Paused...',
};

const buttonText = {
  SOLVED: 'I know, thanks',
  FILLED: 'Dagnabbit',
  PAUSED: 'Resume',
};

const sounds = {
  SOLVED: new UIfx('sounds/tada.mp3', { volume: 0.2 }),
  FILLED: new UIfx('sounds/doh.mp3', { volume: 0.2 }),
  PAUSED: null,
};

interface PuzzleModalProps {
  reason: ModalReason;
  onClose: (reason: ModalReason) => void;
}

export default function PuzzleModal({ reason, onClose }: PuzzleModalProps) {
  const showHideClassName = reason === 'PAUSED' ? 'display-block' : 'modal-dimmer display-block';

  // play sound effect if any
  useEffect(() => {
    sounds[reason]?.play();
  }, [reason]);

  // let enter key dismiss
  useEffect(() => {
    // TODO would be nice to have button go into pressed state on keydown
    // but this seems nontrivial esp w/o jquery
    // https://teamtreehouse.com/community/how-to-add-enter-event-listener-aside-from-clicking-the-button
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') onClose(reason);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reason, onClose]);

  return (
    <div className={showHideClassName + ' ModalWrapper-wrapper ModalWrapper-stretch'}>
      <div className={reason === 'PAUSED' ? '' : ' ModalWrapper-overlay ModalWrapper-stretch'} />
      <div className="ModalBody-body" tabIndex={-1}>
        <article className="ModalBody-content">
          <div>{message[reason]}</div>
          <div className="buttons-modalButtonContainer">
            <button className="buttons-modalButton" onClick={() => onClose(reason)}>
              <div>
                <span>{buttonText[reason]}</span>
              </div>
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
