import React, { useEffect } from 'react';

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
  SOLVED: 'sounds/tada.mp3',
  FILLED: 'sounds/doh.mp3',
};

interface PuzzleModalProps {
  reason: ModalReason;
  onClose: (reason: ModalReason) => void;
}

export default function PuzzleModal({ reason, onClose }: PuzzleModalProps) {
  const showHideClassName = reason === 'PAUSED' ? 'display-block' : 'modal-dimmer display-block';

  // play sound effect if any
  useEffect(() => {
    if (reason !== 'PAUSED') new Audio(sounds[reason]).play().then();
  }, [reason]);

  // let enter key dismiss
  useEffect(() => {
    // TODO would be nice to have button go into pressed state on keydown
    // but this seems nontrivial esp w/o jquery
    // https://teamtreehouse.com/community/how-to-add-enter-event-listener-aside-from-clicking-the-button
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Enter') onClose(reason);
    };
    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
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
