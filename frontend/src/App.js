import React from 'react';
import 'normalize.css';
import './styles/xword.css';
import './styles/from-nyt.css';
import './styles/nyt-fonts';
import PuzzleLoader from './components/PuzzleLoader';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <PuzzleLoader />
    </ToastProvider>
  );
}

export default App;
