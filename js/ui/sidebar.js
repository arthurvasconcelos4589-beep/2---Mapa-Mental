/* ============================================================
   SIDEBAR DIREITA
   ============================================================ */

function updateSidebar() {
  const title =
    document.getElementById("notesTitle");

  const body =
    document.getElementById("notesBody");

  const empty =
    document.getElementById("notesEmpty");

  const note =
    document.getElementById("note");

  const node =
    AppState.selectedId
      ? getNode(AppState.selectedId)
      : null;

  if (!node) {
    title.textContent =
      "Nenhum bloco selecionado";

    empty.hidden = false;
    body.hidden = true;

    return;
  }

  title.textContent = node.title;
  note.innerHTML = node.note || "";

  empty.hidden = true;
  body.hidden = false;
}

function saveCurrentNote() {
  if (!AppState.selectedId) {
    return;
  }

  const node =
    getNode(AppState.selectedId);

  if (!node) return;

  node.note =
    document.getElementById(
      "note"
    ).innerHTML;

  touchMapEdited();
  saveData(true);
}

/*
  Salvamento automático: a anotação (texto e formatação)
  salva sozinha a cada digitação — não existe mais um botão
  de "Salvar" explícito, mas a função continua disponível
  caso seja útil chamar de outro lugar.
*/

async function renameSelectedNode() {
  if (!AppState.selectedId) {
    return;
  }

  const node =
    getNode(AppState.selectedId);

  if (!node) return;

  const name = await showPrompt(
    "Nome do bloco:",
    node.title
  );

  if (name === null) return;

  pushHistory();

  node.title =
    name.trim() || "SEM TÍTULO";

  touchMapEdited();
  render();
  saveData();
}

function toggleNotesPanel() {
  const panel =
    document.getElementById(
      "notesPanel"
    );

  panel.classList.toggle("closed");

  document.body.classList.toggle(
    "notes-closed",
    panel.classList.contains("closed")
  );

  updateSidebarWidthVars();
  resizeBoard();
}

function openNotesPanel() {
  const panel =
    document.getElementById(
      "notesPanel"
    );

  panel.classList.remove("closed");

  document.body.classList.remove(
    "notes-closed"
  );

  updateSidebarWidthVars();
  resizeBoard();
}
