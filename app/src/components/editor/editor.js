import "../../helpers/iframeLoader.js";
import axios from "axios";
import React, { Component } from "react";
import DOMHelper from "../../helpers/dom-helper";
import EditorText from "../editor-text";
import UIKit from "uikit";
import Spinner from "../spinner";
import ConfirmModal from "../confirm-modal";
import ChooseModal from "../choose-modal";
import Panel from "../panel";
import EditorMeta from "../editor-meta";
import EditorImages from "../editor-images";
import Login from "../login";

export default class Editor extends Component {
  constructor() {
    super();

    this.currentPage = "index.html";
    this.state = {
      pageList: [],
      backupsList: [],
      newPageName: "",
      isLoading: true,
      isAuth: false,
      isLoginError: false,
      isLoginLengthError: false,
    };

    this.init = this.init.bind(this);
    // this.createNewPage = this.createNewPage.bind(this);
    this.save = this.save.bind(this);
    this.startSpinner = this.startSpinner.bind(this);
    this.stopSpinner = this.stopSpinner.bind(this);
    this.restoreBackup = this.restoreBackup.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  componentDidMount() {
    this.checkAuth();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.isAuth !== prevState.isAuth) {
      this.init(null, this.currentPage);
    }
  }

  checkAuth() {
    axios.get("./api/checkAuth.php").then((res) => {
      this.setState({
        isAuth: res.data.auth,
      });
    });
  }

  login(pass) {
    if (pass.length > 5) {
      axios.post("./api/login.php", { password: pass }).then((res) => {
        this.setState({
          isAuth: res.data.auth,
          isLoginError: !res.data.auth,
          isLoginLengthError: false,
        });
      });
    } else {
      this.setState({
        isLoginError: false,
        isLoginLengthError: true,
      });
    }
  }

  logout() {
    axios.get("./api/logout.php").then(() => {
      window.location.replace("/");
    });
  }

  init(e, page) {
    if (e) {
      e.preventDefault();
    }

    if (this.state.isAuth) {
      this.startSpinner();
      this.iframe = document.querySelector("iframe");
      this.open(page);
      this.loadPageList();
      this.loadBackupsList();
    }
  }

  open(page) {
    this.currentPage = page;

    axios
      .get(`../../${page}?rnd=${Math.random()}`)
      .then((res) => DOMHelper.parseStringToDOM(res.data))
      .then(DOMHelper.wrapTextNodes)
      .then(DOMHelper.wrapImages)
      .then((dom) => {
        this.virtualDOM = dom;
        return dom;
      })
      .then(DOMHelper.serializeDOMToString)
      .then((html) => axios.post("./api/saveTempPage.php", { html }))
      .then(() =>
        this.iframe.load("../k4l3kds04-30kfk3-4kfokoj.340kd0ff-.43f;gd.html")
      )
      .then(() => axios.post("./api/deleteTempPage.php"))
      .then(() => this.enableEditing())
      .then(() => this.injectStyles())
      .then(() => this.stopSpinner());

    this.loadBackupsList();
  }

  async save() {
    const newDOM = this.virtualDOM.cloneNode(this.virtualDOM);
    DOMHelper.unwrapTextNodes(newDOM);
    DOMHelper.unwrapImages(newDOM);
    const html = DOMHelper.serializeDOMToString(newDOM);
    this.startSpinner();
    await axios
      .post("./api/savePage.php", {
        pageName: this.currentPage,
        html,
      })
      .then(() => this.showNotification("Успешно сохранено", "success"))
      .catch(() => this.showNotification("Ошибка сохранения", "danger"))
      .finally(this.stopSpinner);

    this.loadBackupsList();
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

    this.iframe.contentDocument.body
      .querySelectorAll("[editableimgid]")
      .forEach((element) => {
        const nodeId = element.getAttribute("editableimgid");
        const virtualElement = this.virtualDOM.body.querySelector(
          `[editableimgid="${nodeId}"]`
        );

        new EditorImages(
          element,
          virtualElement,
          this.startSpinner,
          this.stopSpinner,
          this.showNotification
        );
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
      [editableimgid]:hover {
        outline: 3px solid orange;
        outline-offset: 8px;
      }
    `;
    this.iframe.contentDocument.head.appendChild(style);
  }

  showNotification(message, status) {
    UIKit.notification({
      message,
      status,
    });
  }

  loadPageList() {
    axios.get("./api/pageList.php").then((res) => {
      this.setState(() => {
        return {
          pageList: res.data,
        };
      });
    });
  }

  loadBackupsList() {
    axios
      .get("./backups/backups.json")
      .then((res) =>
        this.setState(() => {
          return {
            backupsList: res.data.filter(
              (backup) => backup.page === this.currentPage
            ),
          };
        })
      )
      .catch(() => null);
  }

  restoreBackup(e, backup) {
    if (e) {
      e.preventDefault();
    }

    UIKit.modal
      .confirm(
        "Вы действительно хотите восстановить страницу из этой резервной копии? Все несохраненные данные будут потеряны!",
        {
          labels: { ok: "Восстановить", cancel: "Отмена" },
        }
      )
      .then(() => {
        this.startSpinner();
        return axios
          .post("./api/restoreBackup.php", {
            page: this.currentPage,
            file: backup,
          })
          .then((data) => {
            this.open(this.currentPage);
            this.stopSpinner();
          });
      })
      .catch(() => null);
  }

  // createNewPage() {
  //   axios
  //     .post("./api/createNewPage.php", { name: this.state.newPageName })
  //     .then(() => {
  //       this.loadPageList();
  //     })
  //     .catch(() => alert("Страница уже существует"));
  // }

  // deletePage(page) {
  //   axios
  //     .post("./api/deletePage.php", { name: page })
  //     .then(() => {
  //       this.loadPageList();
  //     })
  //     .catch(() => {
  //       alert("Страницы не существует");
  //     });
  // }

  startSpinner() {
    this.setState({ isLoading: true });
  }

  stopSpinner() {
    this.setState({ isLoading: false });
  }

  render() {
    const {
      isLoading,
      pageList,
      backupsList,
      isAuth,
      isLoginError,
      isLoginLengthError,
    } = this.state;
    const modal = true;

    let spinner;

    isLoading ? (spinner = <Spinner active />) : (spinner = <Spinner />);

    if (!isAuth) {
      return (
        <Login
          login={this.login}
          lengthErr={isLoginLengthError}
          loginErr={isLoginError}
        />
      );
    }

    return (
      <>
        <iframe src="" frameBorder="0"></iframe>
        <input
          id="img-upload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
        />
        {spinner}
        <Panel />
        <ConfirmModal
          modal={modal}
          target={"modal-save"}
          method={this.save}
          texts={{
            title: "Сохранение",
            description: "Вы действительно хотите сохранить изменения?",
            btn: "Опубликовать",
          }}
        />
        <ConfirmModal
          modal={modal}
          target={"modal-logout"}
          method={this.logout}
          texts={{
            title: "Выход",
            description:
              "Вы действительно хотите выйти из административной панели?",
            btn: "Выйти",
          }}
        />
        <ChooseModal
          modal={modal}
          target={"modal-open"}
          data={pageList}
          redirect={this.init}
        />
        <ChooseModal
          modal={modal}
          target={"modal-backup"}
          data={backupsList}
          redirect={this.restoreBackup}
        />
        {this.virtualDOM ? (
          <EditorMeta
            modal={modal}
            target={"modal-meta"}
            virtualDom={this.virtualDOM}
          />
        ) : (
          false
        )}
      </>
    );
  }
}
