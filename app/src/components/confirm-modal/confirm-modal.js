import React from "react";
import UIKit from "uikit";

const ConfirmModal = ({ modal, target, method }) => {
  return (
    <div id={target} uk-modal={modal.toString()} container="false">
      <div className="uk-modal-dialog uk-modal-body">
        <h2 className="uk-modal-title">Сохранение</h2>
        <p>Вы дейстительно хотите сохранить изменения?</p>
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
            onClick={() =>
              method(
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
  );
};

export default ConfirmModal;
