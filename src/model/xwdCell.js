import { observable, decorate } from "mobx";

class XwdCell {
  isBlack = false;
  content = "";
  number = null;

  toggleBlack() {
    this.isBlack = !this.isBlack;
  }
}

decorate(XwdCell, {
  isBlack: observable,
  content: observable,
  number: observable
});

export default XwdCell;
