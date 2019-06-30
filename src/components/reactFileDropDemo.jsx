import React from "react";
import FileDrop from "react-file-drop";
import { puzzleFromFileData } from "../services/xwdService";

class ReactFileDropDemo extends React.Component {
  handleDrop = (files, event) => {
    const reader = new FileReader();

    reader.onabort = () => console.log("file reading was aborted");
    reader.onerror = () => console.log("file reading has failed");
    reader.onload = () => {
      // Do whatever you want with the file contents
      const arrayBuffer = reader.result;
      const puz = puzzleFromFileData(arrayBuffer);
    };

    reader.readAsArrayBuffer(files[0]);
  };

  render() {
    const styles = {
      border: "1px solid black",
      width: 600,
      color: "black",
      padding: 20
    };
    return (
      <div id="react-file-drop-demo" style={{ styles }}>
        <FileDrop onDrop={this.handleDrop}>Drop some files here!</FileDrop>
      </div>
    );
  }
}

export default ReactFileDropDemo;
