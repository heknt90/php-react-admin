import React from "react";
import UIKit from "uikit";

const ConfirmModal = ({ modal, target, method, texts }) => {
  const { title, description, btn } = texts;
  return (
    <div id={target} uk-modal={modal.toString()} container="false">
      <div className="uk-modal-dialog uk-modal-body">
        <h2 className="uk-modal-title">{title}</h2>
        <p>{description}</p>
        <p className="uk-text-right">
          <button
            className="uk-button uk-button-default uk-margin-small-right uk-modal-close "
            type="button"
          >
            Отменить
          </button>
          <button
            className="uk-button uk-button-primary uk-modal-close"
            type="button"
            onClick={() => method()}
          >
            {btn}
          </button>
        </p>
      </div>
    </div>
  );
};

export default ConfirmModal;
