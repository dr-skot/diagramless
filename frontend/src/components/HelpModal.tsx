import React from 'react';

interface HelpModalProps {
  onClose: () => void;
}

const sectionStyle: React.CSSProperties = {
  width: '100%',
  marginBottom: '1.2em',
};

const headingStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: '#666',
  marginBottom: '0.4em',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  padding: '0.25em 0',
  fontSize: '0.85rem',
  lineHeight: '1.3',
};

const keyStyle: React.CSSProperties = {
  fontWeight: 700,
  minWidth: '100px',
  color: '#333',
};

const descStyle: React.CSSProperties = {
  color: '#555',
};

const subHeadingStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: '#999',
  fontStyle: 'italic',
  marginTop: '0.5em',
  marginBottom: '0.3em',
};

export default function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="modal-dimmer display-block ModalWrapper-wrapper ModalWrapper-stretch">
      <div className="ModalWrapper-overlay ModalWrapper-stretch" />
      <div className="ModalBody-body" tabIndex={-1}>
        <article className="ModalBody-content" style={{ alignItems: 'flex-start' }}>

          <div style={sectionStyle}>
            <div style={headingStyle}>Diagramless Tools</div>
            <div style={subHeadingStyle}>keyboard</div>
            <div style={rowStyle}>
              <span style={keyStyle}>. (period)</span>
              <span style={descStyle}>Toggle black/white</span>
            </div>
            <div style={rowStyle}>
              <span style={keyStyle}>0-9</span>
              <span style={descStyle}>Number current cell (if auto-numbering is off)</span>
            </div>
            <div style={subHeadingStyle}>menus</div>
            <div style={rowStyle}>
              <span style={keyStyle}>Symmetry</span>
              <span style={descStyle}>Mirror black cells (left-right or diagonal)</span>
            </div>
            <div style={rowStyle}>
              <span style={keyStyle}>Numbering</span>
              <span style={descStyle}>Auto-number cells based on current diagram</span>
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={headingStyle}>Basics</div>
            <div style={rowStyle}>
              <span style={keyStyle}>Arrows</span>
              <span style={descStyle}>Move cursor</span>
            </div>
            <div style={rowStyle}>
              <span style={keyStyle}>Tab / Shift-Tab</span>
              <span style={descStyle}>Forward/backward one word</span>
            </div>
            <div style={rowStyle}>
              <span style={keyStyle}>Space</span>
              <span style={descStyle}>Change direction (across/down)</span>
            </div>
            <div style={rowStyle}>
              <span style={keyStyle}>Backspace</span>
              <span style={descStyle}>Clear cell or move back</span>
            </div>
          </div>

          <div className="buttons-modalButtonContainer" style={{ justifyContent: 'center' }}>
            <button className="buttons-modalButton" style={{ width: '100%' }} onClick={onClose}>
              <div><span>Got it</span></div>
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
