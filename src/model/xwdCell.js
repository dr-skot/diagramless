import { observable, decorate } from "mobx";

class XwdCell {
  isBlack = false;
  content = "";
  number = null;
  isVerified = false;
  isMarkedWrong = false;
  wasRevealed = false;

  toggleBlack() {
    this.isBlack = !this.isBlack;
  }
}

decorate(XwdCell, {
  isBlack: observable,
  content: observable,
  number: observable,
  isVerified: observable,
  isMarkedWrong: observable,
  wasRevealed: observable
});

export default XwdCell;
