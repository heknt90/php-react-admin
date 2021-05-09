import "../../helpers/iframeLoader.js";
import axios from "axios";
import React, { Component } from "react";
import DOMHelper from "../../helpers/dom-helper";
import EditorText from "../editor-text";

export default class Editor extends Component {
  constructor() {
    super();

    this.currentPage = "index.html";
    this.state = {
      pageList: [],
      newPageName: "",
    };

    this.createNewPage = this.createNewPage.bind(this);
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
      .then(() => this.injectStyles());
    // .then((data) => connsole.log(data));
    // this.iframe.load(this.currentPage, () => {
    //
    // });
  }

  save() {
    const newDOM = this.virtualDOM.cloneNode(this.virtualDOM);
    DOMHelper.unwrapTextNodes(newDOM);
    const html = DOMHelper.serializeDOMToString(newDOM);
    axios.post("./api/savePage.php", {
      pageName: this.currentPage,
      html,
    });
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

  render() {
    // const { pageList } = this.state;

    // const pages = pageList.map((page, ind) => (
    //   <li key={ind}>
    //     {page}{" "}
    //     <a href="#" onClick={() => this.deletePage(page)}>
    //       x
    //     </a>
    //   </li>
    // ));
    return (
      <>
        <button onClick={() => this.save()}>Save Page</button>
        <iframe src={this.currentPage} frameBorder="0"></iframe>
      </>
      //   <>
      //     <input
      //       onChange={(e) => {
      //         this.setState(() => ({
      //           newPageName: e.target.value,
      //         }));
      //       }}
      //       type="text"
      //     />
      //     <button onClick={this.createNewPage}>Создать страницу</button>
      //     <ul>{pages}</ul>
      //   </>
    );
  }
}
