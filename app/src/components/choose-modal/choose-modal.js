import React from "react";
import UIKit from "uikit";

const ChooseModal = ({ modal, target, data, redirect }) => {
  const list = data.map((page) => {
    if (page.time) {
      return (
        <li key={page.file}>
          <a
            className="uk-link-muted uk-modal-close"
            href="#"
            onClick={(e) => {
              redirect(e, page.file);
            }}
          >
            Резервная копия от {page.time}
          </a>
        </li>
      );
    } else {
      return (
        <li key={page}>
          <a
            className="uk-link-muted uk-modal-close"
            href="#"
            onClick={(e) => {
              redirect(e, page);
            }}
          >
            {page}
          </a>
        </li>
      );
    }
  });

  let msg;
  if (data.length < 1) {
    msg = "Резервные копии не найдены";
  }

  return (
    <div id={target} uk-modal={modal.toString()} container="false">
      <div className="uk-modal-dialog uk-modal-body">
        <h2 className="uk-modal-title">Открыть</h2>
        {msg}
        <ul className="uk-list uk-list-divider">{list}</ul>

        <p className="uk-text-right">
          <button
            className="uk-button uk-button-default uk-modal-close"
            type="button"
          >
            Отменить
          </button>
        </p>
      </div>
    </div>
  );
};

export default ChooseModal;
