import React, { useCallback } from 'react';
import FileDrop from 'react-file-drop';
import { parseXWordInfoJson } from '../services/xwordInfoService';
import { XwdPuzzle } from '../model/puzzle';

interface XWordInfoImporterProps {
  onPuzzleLoaded: (puzzle: XwdPuzzle) => void;
}

const XWordInfoImporter: React.FC<XWordInfoImporterProps> = ({ onPuzzleLoaded }) => {
  const [error, setError] = React.useState<string | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const jsonString = e.target?.result as string;
          const puzzle = parseXWordInfoJson(jsonString);
          
          if (puzzle) {
            onPuzzleLoaded(puzzle);
          } else {
            setError('Failed to parse the XWordInfo puzzle file. Please make sure it\'s in the correct format.');
          }
        } catch (error) {
          console.error('Error reading file:', error);
          setError('Error reading file. Please try again.');
        }
      };

      reader.readAsText(file);
    },
    [onPuzzleLoaded]
  );

  const handleDrop = useCallback(
    (files: FileList | null) => {
      handleFiles(files);
    },
    [handleFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    },
    [handleFiles]
  );

  return (
    <div className="xwordinfo-importer">
      <h3>Import from XWordInfo</h3>
      
      <div className="file-upload-section">
        <p>You can import puzzle data from XWordInfo in two ways:</p>
        
        <div className="method-section">
          <h4>Option 1: Use the Python Script</h4>
          <p>For easier downloading, use the included Python script:</p>
          <ol>
            <li>Navigate to the <code>scripts</code> folder in the project directory</li>
            <li>Run <code>python fetch_xwordinfo.py MM/DD/YYYY</code> to download a puzzle for a specific date</li>
            <li>Upload the generated JSON file below</li>
          </ol>
          <p className="note">See the README in the scripts folder for more details.</p>
        </div>
        
        <div className="method-section">
          <h4>Option 2: Manual Download</h4>
          <p>You can also manually download puzzle data:</p>
          <ol>
            <li>Visit <a href="https://www.xwordinfo.com" target="_blank" rel="noopener noreferrer">XWordInfo.com</a></li>
            <li>Navigate to the puzzle you want to import</li>
            <li>Right-click on the page and select "View Page Source"</li>
            <li>Look for a JSON object starting with <code>{"{"}"title":</code></li>
            <li>Copy the entire JSON object (from <code>{"{"}</code> to <code>{"}"}</code>)</li>
            <li>Save it to a file with a <code>.json</code> extension</li>
          </ol>
        </div>
        
        <div className="upload-section">
          <h4>Upload JSON File</h4>
          <FileDrop onDrop={handleDrop}>
            <div className="file-drop-target">
              <p>Drop XWordInfo JSON file here</p>
              <p>or</p>
              <input
                type="file"
                accept=".json"
                onChange={handleChange}
              />
            </div>
          </FileDrop>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <style jsx>{`
        .xwordinfo-importer {
          margin: 20px 0;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .method-section {
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .upload-section {
          margin-top: 20px;
        }
        
        .note {
          font-size: 0.9em;
          color: #666;
          font-style: italic;
        }
        
        .file-drop-target {
          padding: 20px;
          border: 2px dashed #ccc;
          border-radius: 4px;
          text-align: center;
          cursor: pointer;
        }
        
        .file-drop-target:hover {
          border-color: #999;
        }
        
        .error-message {
          margin-top: 15px;
          padding: 10px;
          background-color: #ffebee;
          color: #c62828;
          border-radius: 4px;
        }
        
        code {
          background-color: #f5f5f5;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
};

export default XWordInfoImporter;
