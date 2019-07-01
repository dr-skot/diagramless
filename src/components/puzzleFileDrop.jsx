import React, { Component } from "react";
import FileDrop from "react-file-drop";

class PuzzleFileDrop extends Component {
  handleDrop = (files, event) => {
    console.log("drop!", files, event);
    const reader = new FileReader();

    reader.onabort = () => console.log("File reading was aborted");
    reader.onerror = () => console.log("File reading has failed");
    reader.onload = () => {
      this.props.onFileLoad(reader.result);
    };

    reader.readAsArrayBuffer(files[0]);
  };

  render() {
    return (
      <div id="react-file-drop-demo">
        <FileDrop onDrop={this.handleDrop}>Drop a puzzle file here!</FileDrop>
      </div>
    );
  }
}

export default PuzzleFileDrop;