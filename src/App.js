import React from "react";
import "./App.css";
import "./xword.css";
import "./nyt.css";
import "./nyt-fonts";
import "./reactFileDropDemo.css";
import PuzzleLoader from "./components/PuzzleLoader";
import { configure } from "mobx";

configure({ enforceActions: "always" });

function App() {
  return <PuzzleLoader />;
}

export default App;
