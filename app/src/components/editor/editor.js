import "../../helpers/iframeLoader.js";
import axios from "axios";
import React, { Component } from "react";
import DOMHelper from "../../helpers/dom-helper";
import EditorText from "../editor-text";
import UIKit from "uikit";
import Spinner from "../spinner";

export default class Editor extends Component {
  constructor() {
    super();

    this.currentPage = "index.html";
    this.state = {
      pageList: [],
      newPageName: "",
      isLoading: true,
    };

    this.createNewPage = this.createNewPage.bind(this);

    this.startSpinner = this.startSpinner.bind(this);
    this.stopSpinner = this.stopSpinner.bind(this);
  }

  componentDidMount() {
    this.init(this.currentPage);
  }

  init(page) {
    this.iframe = document.querySelector("iframe");
    this.open(page);
    this.loadPageList();
  }

  open(page) {
    this.currentPage = page;

    axios
      .get(`../../${page}?rnd=${Math.random()}`)
      .then((res) => DOMHelper.parseStringToDOM(res.data))
      .then(DOMHelper.wrapTextNodes)
      .then((dom) => {
        this.virtualDOM = dom;
        return dom;
      })
      .then(DOMHelper.serializeDOMToString)
      .then((html) => axios.post("./api/saveTempPage.php", { html }))
      .then(() => this.iframe.load("../temp.html"))
      .then(() => this.enableEditing())
      .then(() => this.injectStyles())
      .then(() => this.stopSpinner());
  }

  save(onResolve, onReject) {
    const newDOM = this.virtualDOM.cloneNode(this.virtualDOM);
    DOMHelper.unwrapTextNodes(newDOM);
    const html = DOMHelper.serializeDOMToString(newDOM);
    this.startSpinner();
    axios
      .post("./api/savePage.php", {
        pageName: this.currentPage,
        html,
      })
      .then(onResolve)
      .catch(onReject)
      .finally(this.stopSpinner);
  }

  enableEditing() {
    this.iframe.contentDocument.body
      .querySelectorAll("text-editor")
      .forEach((element) => {
        const nodeId = element.getAttribute("nodeid");
        const virtualElement = this.virtualDOM.body.querySelector(
          `[nodeid="${nodeId}"]`
        );

        new EditorText(element, virtualElement);
      });
  }

  injectStyles() {
    const style = this.iframe.contentDocument.createElement("style");
    style.innerHTML = `
      text-editor:hover {
        outline: 3px solid orange;
        outline-offset: 8px;
      }
      text-editor:focus {
        outline: 3px solid red;
        outline-offset: 8px;
      }
    `;
    this.iframe.contentDocument.head.appendChild(style);
  }

  loadPageList() {
    axios.get("./api").then((res) => {
      this.setState(() => {
        return {
          pageList: res.data,
        };
      });
    });
  }

  createNewPage() {
    axios
      .post("./api/createNewPage.php", { name: this.state.newPageName })
      .then(() => {
        this.loadPageList();
      })
      .catch(() => alert("Страница уже существует"));
  }

  deletePage(page) {
    axios
      .post("./api/deletePage.php", { name: page })
      .then(() => {
        this.loadPageList();
      })
      .catch(() => {
        alert("Страницы не существует");
      });
  }

  startSpinner() {
    this.setState({ isLoading: true });
  }

  stopSpinner() {
    this.setState({ isLoading: false });
  }

  render() {
    const { isLoading } = this.state;
    const modal = true;

    let spinner;

    isLoading ? (spinner = <Spinner active />) : (spinner = <Spinner />);

    return (
      <>
        <iframe src={this.currentPage} frameBorder="0"></iframe>

        {spinner}

        <div className="panel">
          <button
            className="uk-button uk-button-primary"
            uk-toggle="target: #modal-save"
          >
            Опубликовать
          </button>
        </div>

        <div id="modal-save" uk-modal={modal.toString()} container="false">
          <div className="uk-modal-dialog uk-modal-body">
            <h2 className="uk-modal-title">Сохранение</h2>
            <p>Вы дейстительно хотите сохранить изменения?</p>
            <p className="uk-text-right">
              <button
                className="uk-button uk-button-default uk-modal-close"
                type="button"
              >
                Отменить
              </button>
              <button
                className="uk-button uk-button-primary uk-modal-close"
                type="button"
                onClick={() =>
                  this.save(
                    () => {
                      UIKit.notification({
                        message: "Изменения сохранены!",
                        status: "success",
                      });
                    },
                    () => {
                      UIKit.notification({
                        message: "Ошибка сохранения",
                        status: "danger",
                      });
                    }
                  )
                }
              >
                Опубликовать
              </button>
            </p>
          </div>
        </div>
      </>
    );
  }
}
