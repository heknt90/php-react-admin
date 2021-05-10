import React from "react";
import UIKit from "uikit";

const ChooseModal = ({ modal, target, data, redirect }) => {
  const pageList = data
    .filter((item) => item !== "k4l3kds04-30kfk3-4kfokoj.340kd0ff-.43f;gd.html")
    .map((page) => {
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
    });

  return (
    <div id={target} uk-modal={modal.toString()} container="false">
      <div className="uk-modal-dialog uk-modal-body">
        <h2 className="uk-modal-title">Открыть</h2>

        <ul className="uk-list uk-list-divider">{pageList}</ul>

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
