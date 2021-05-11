import axios from "axios";

export default class EditorImages {
  constructor(
    element,
    virtualElement,
    ...[startSpinner, stopSpinner, showNotification]
  ) {
    this.element = element;
    this.virtualElement = virtualElement;
    // console.log(element, virtualElement);

    this.element.addEventListener("click", () => this.onClick());
    this.imgUploader = document.querySelector("#img-upload");

    this.startSpinner = startSpinner;
    this.stopSpinner = stopSpinner;
    this.showNotification = showNotification;
  }

  onClick() {
    this.imgUploader.click();
    this.imgUploader.addEventListener("change", () => {
      if (this.imgUploader.files && this.imgUploader.files[0]) {
        let formData = new FormData();
        formData.append("image", this.imgUploader.files[0]);
        this.startSpinner();
        axios
          .post("./api/uploadImage.php", formData, {
            headers: {
              "Content-Type": "multipart/from-data",
            },
          })
          .then((res) => {
            this.virtualElement.src =
              this.element.src = `./img/${res.data.src}`;
          })
          .catch(() => this.showNotification("Ошибка сохранения", "danger"))
          .finally(() => {
            this.imgUploader.value = "";
            this.stopSpinner();
          });
      }
    });
  }
}
