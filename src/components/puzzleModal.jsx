import React, { Component } from 'react';
import UIfx from 'uifx';

import booAudio from '../sounds/doh.mp3';
import yayAudio from '../sounds/tada.mp3';

export const SOLVED = 'SOLVED',
  FILLED = 'FILLED',
  PAUSED = 'PAUSED';

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
  SOLVED: new UIfx({ asset: yayAudio, volume: 0.5 }),
  FILLED: new UIfx({ asset: booAudio, volume: 0.5 }),
};

class PuzzleModal extends Component {
  componentDidMount = () => {
    window.addEventListener('keyup', this.handleKeyUp);
  };

  componentWillUnmount = () => {
    window.removeEventListener('keyup', this.handleKeyUp);
  };

  // TODO would be nice to have button go into pressed state on keydown
  // but this seems nontrivial esp w/o jquery
  // https://teamtreehouse.com/community/how-to-add-enter-event-listener-aside-from-clicking-the-button
  handleKeyUp = (event) => {
    const { reason, onClose } = this.props;
    if (reason && event.keyCode === 13) {
      onClose(reason);
    }
  };

  render() {
    const { reason, onClose } = this.props;
    const showHideClassName = !reason
      ? 'display-none'
      : reason === PAUSED
      ? 'display-block'
      : 'modal-dimmer display-block';

    sounds[reason]?.play();

    return (
      <div className={showHideClassName + ' ModalWrapper-wrapper ModalWrapper-stretch'}>
        <div className={reason === PAUSED ? '' : ' ModalWrapper-overlay ModalWrapper-stretch'} />
        <div className="ModalBody-body" tabIndex="-1">
          <article className="ModalBody-content">
            <div>{message[reason]}</div>
            <div className="buttons-modalButtonContainer">
              <button
                ref={(el) => (this.button = el)}
                className="buttons-modalButton"
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
  }
}

export default PuzzleModal;
