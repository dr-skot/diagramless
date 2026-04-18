import React from 'react';

export type SolveMode = 'diagramless' | 'withDiagram';

interface SolveModeModalProps {
  onChoose: (mode: SolveMode) => void;
}

export default function SolveModeModal({ onChoose }: SolveModeModalProps) {
  return (
    <div className="modal-dimmer display-block ModalWrapper-wrapper ModalWrapper-stretch">
      <div className="ModalWrapper-overlay ModalWrapper-stretch" />
      <div className="ModalBody-body" tabIndex={-1}>
        <article className="ModalBody-content">
          <div style={{ marginBottom: '1.2em', fontSize: '1.1rem' }}>How would you like to solve?</div>
          <div className="buttons-modalButtonContainer" style={{ flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', width: '100%' }}>
              <button className="buttons-modalButton" style={{ width: '100%' }} onClick={() => onChoose('withDiagram')}>
                <div><span>With Diagram</span></div>
              </button>
              <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>Show the black squares</div>
            </div>
            <div style={{ textAlign: 'center', width: '100%' }}>
              <button className="buttons-modalButton" style={{ width: '100%' }} onClick={() => onChoose('diagramless')}>
                <div><span>Diagramless</span></div>
              </button>
              <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>Find the black squares yourself</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>(You can always reveal the diagram later)</div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
