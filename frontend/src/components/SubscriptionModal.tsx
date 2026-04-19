import React from 'react';

interface SubscriptionModalProps {
  onConfirm: () => void;
}

export default function SubscriptionModal({ onConfirm }: SubscriptionModalProps) {
  return (
    <div className="modal-dimmer display-block ModalWrapper-wrapper ModalWrapper-stretch">
      <div className="ModalWrapper-overlay ModalWrapper-stretch" />
      <div className="ModalBody-body" tabIndex={-1}>
        <article className="ModalBody-content">
          <div style={{ marginBottom: '1em', fontSize: '1.1rem' }}>
            This app uses puzzles from the New York Times.
          </div>
          <div style={{ marginBottom: '1.2em', fontSize: '0.85rem', color: '#666', textAlign: 'center', lineHeight: '1.4' }}>
            An NYT Games subscription is required to access these puzzles.
            By continuing, you confirm that you have an active subscription.
          </div>
          <div className="buttons-modalButtonContainer" style={{ justifyContent: 'center' }}>
            <button className="buttons-modalButton" style={{ width: '100%' }} onClick={onConfirm}>
              <div><span>I have a subscription</span></div>
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
