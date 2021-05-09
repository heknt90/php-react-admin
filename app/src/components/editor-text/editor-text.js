export default class EditorText {
  constructor(element, virtualElement) {
    // console.log("AZAZA", element, virtualElement);
    this.element = element;
    this.virtualElement = virtualElement;

    this.element.addEventListener("click", () => this.onClick());
    this.element.addEventListener("blur", () => this.onBlur());
    this.element.addEventListener("keypress", (e) => this.onKeyPress(e));
    this.element.addEventListener("input", () => this.onTextEdit());

    // element.addEventListener("input", () => {
    //   this.onTextEdit(element);
    // });
  }

  onClick() {
    this.element.contentEditable = "true";
    this.element.focus();
  }

  onBlur() {
    this.element.removeAttribute("contenteditable");
  }

  onKeyPress(e) {
    if (e.keyCode === 13) {
      this.element.blur();
    }
  }

  onTextEdit() {
    this.virtualElement.innerText = this.element.innerText;
  }
}
