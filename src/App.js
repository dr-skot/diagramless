import React from "react";
import "./App.css";
import "./xword.css";
import "./nyt.css";
import "./nyt-fonts";
import "./reactFileDropDemo.css";
import Puzzle from "./components/puzzle";
import { configure } from "mobx";

configure({ enforceActions: "always" });

function App() {
  return <Puzzle />;
}

export default App;
