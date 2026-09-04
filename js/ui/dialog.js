/* ============================================================
   DIÁLOGOS
   Substitui alert / confirm / prompt nativos por um modal
   no mesmo tom preto e branco do resto da página.
   ============================================================ */

function buildDialogRoot() {
  if (document.getElementById("dialogOverlay")) {
    return;
  }

  const overlay =
    document.createElement("div");

  overlay.id = "dialogOverlay";
  overlay.className = "dialog-overlay";
  overlay.hidden = true;

  overlay.innerHTML = `
    <div class="dialog-box" role="dialog" aria-modal="true">
      <div class="dialog-message" id="dialogMessage"></div>
      <input class="dialog-input" id="dialogInput" hidden />
      <div class="dialog-actions">
        <button id="dialogCancelBtn" hidden>Cancelar</button>
        <button class="primary" id="dialogOkBtn">OK</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}

function openDialog({
  message,
  showInput,
  inputValue,
  showCancel
}) {
  buildDialogRoot();

  const overlay =
    document.getElementById(
      "dialogOverlay"
    );

  const messageEl =
    document.getElementById(
      "dialogMessage"
    );

  const input =
    document.getElementById(
      "dialogInput"
    );

  const okBtn =
    document.getElementById(
      "dialogOkBtn"
    );

  const cancelBtn =
    document.getElementById(
      "dialogCancelBtn"
    );

  messageEl.textContent = message;

  input.hidden = !showInput;
  input.value =
    showInput ? (inputValue || "") : "";

  cancelBtn.hidden = !showCancel;

  overlay.hidden = false;

  if (showInput) {
    requestAnimationFrame(() => {
      input.focus();
      input.select();
    });
  } else {
    okBtn.focus();
  }

  return new Promise(resolve => {
    function cleanup(result) {
      overlay.hidden = true;

      okBtn.removeEventListener(
        "click",
        onOk
      );

      cancelBtn.removeEventListener(
        "click",
        onCancel
      );

      overlay.removeEventListener(
        "click",
        onOverlayClick
      );

      document.removeEventListener(
        "keydown",
        onKeydown
      );

      resolve(result);
    }

    function onOk() {
      cleanup(
        showInput ? input.value : true
      );
    }

    function onCancel() {
      cleanup(
        showInput ? null : false
      );
    }

    function onOverlayClick(event) {
      if (event.target === overlay) {
        onCancel();
      }
    }

    function onKeydown(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        onOk();
      } else if (
        event.key === "Escape"
      ) {
        onCancel();
      }
    }

    okBtn.addEventListener(
      "click",
      onOk
    );

    cancelBtn.addEventListener(
      "click",
      onCancel
    );

    overlay.addEventListener(
      "click",
      onOverlayClick
    );

    document.addEventListener(
      "keydown",
      onKeydown
    );
  });
}

function showAlert(message) {
  return openDialog({
    message,
    showInput: false,
    showCancel: false
  });
}

function showConfirm(message) {
  return openDialog({
    message,
    showInput: false,
    showCancel: true
  });
}

function showPrompt(
  message,
  inputValue = ""
) {
  return openDialog({
    message,
    showInput: true,
    inputValue,
    showCancel: true
  });
}
