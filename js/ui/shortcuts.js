/* ============================================================
   ATALHOS DE TECLADO
   Lista enxuta e sem conflito com atalhos padrão do sistema.
   Cada atalho pode ser reatribuído clicando na tecla, na aba
   Atalhos — com checagem de conflito antes de trocar.
   ============================================================ */

const SHORTCUT_DEFS = [
  {
    id: "new-node",
    label: "Novo bloco",
    defaultKey: "n",
    run: () => createChild()
  },
  {
    id: "duplicate-node",
    label: "Duplicar bloco",
    defaultKey: "ctrl+d",
    run: () => duplicateSelectedNode()
  },
  {
    id: "delete-node",
    label: "Remover bloco",
    defaultKey: "delete",
    run: () => deleteSelectedNode()
  },
  {
    id: "rename-node",
    label: "Renomear",
    defaultKey: "f2",
    run: () => renameSelectedNode()
  },
  {
    id: "toggle-children",
    label: "Abrir/fechar filhos",
    defaultKey: "c",
    run: () => toggleSelectedChildren()
  },
  {
    id: "deselect",
    label: "Desselecionar",
    defaultKey: "escape",
    run: () => deselectAll()
  },
  {
    id: "center-view",
    label: "Centralizar",
    defaultKey: "space",
    run: () => centerView()
  },
  {
    id: "focus-search",
    label: "Buscar mapa",
    defaultKey: "ctrl+k",
    run: () => focusMapSearch()
  },
  {
    id: "toggle-grid",
    label: "Grade",
    defaultKey: "g",
    run: () => toggleGrid()
  }
];

const SHORTCUTS_STORAGE_KEY =
  "mapa-atalhos";

let shortcutOverrides = {};
let remappingId = null;

function loadShortcutOverrides() {
  try {
    const raw = localStorage.getItem(
      SHORTCUTS_STORAGE_KEY
    );

    shortcutOverrides = raw
      ? JSON.parse(raw)
      : {};
  } catch (error) {
    shortcutOverrides = {};
  }
}

function saveShortcutOverrides() {
  localStorage.setItem(
    SHORTCUTS_STORAGE_KEY,
    JSON.stringify(shortcutOverrides)
  );
}

function getEffectiveKey(id) {
  const def = SHORTCUT_DEFS.find(
    d => d.id === id
  );

  return (
    shortcutOverrides[id] ||
    def?.defaultKey
  );
}

/*
  Transforma "ctrl+d" em "Ctrl+D", "space" em "Espaço" etc,
  pra exibir na tecla.
*/
function keyLabel(keyStr) {
  if (!keyStr) return "";

  return keyStr
    .split("+")
    .map(part => {
      if (part === "ctrl") return "Ctrl";
      if (part === "shift") return "Shift";
      if (part === "alt") return "Alt";
      if (part === "space") return "Espaço";
      if (part === "escape") return "Esc";
      if (part === "delete") return "Del";
      if (part.length === 1) {
        return part.toUpperCase();
      }
      return (
        part.charAt(0).toUpperCase() +
        part.slice(1)
      );
    })
    .join("+");
}

/*
  Transforma um KeyboardEvent numa string canônica,
  ex: Ctrl+K vira "ctrl+k".
*/
function keyEventToString(event) {
  const parts = [];

  if (event.ctrlKey || event.metaKey) {
    parts.push("ctrl");
  }
  if (event.shiftKey) parts.push("shift");
  if (event.altKey) parts.push("alt");

  let key = event.key.toLowerCase();

  if (key === " ") key = "space";

  parts.push(key);

  return parts.join("+");
}

function isModifierKey(key) {
  return [
    "control",
    "shift",
    "alt",
    "meta"
  ].includes(key.toLowerCase());
}

function isTypingContext(target) {
  if (!target) return false;

  const tag = target.tagName;

  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    target.isContentEditable
  );
}

function isDialogOpen() {
  const overlay =
    document.getElementById(
      "dialogOverlay"
    );

  const dialogVisible =
    !!overlay && !overlay.hidden;

  return (
    dialogVisible ||
    (typeof isChangelogOpen ===
      "function" &&
      isChangelogOpen())
  );
}

/* ---------- Execução dos atalhos ---------- */

document.addEventListener(
  "keydown",
  event => {
    /*
      Enquanto o usuário está gravando uma nova tecla
      (aba Atalhos), esse listener principal não faz nada —
      quem cuida do evento é o startRemap() abaixo.
    */
    if (remappingId) return;

    if (
      isTypingContext(event.target) ||
      isDialogOpen()
    ) {
      return;
    }

    const combo =
      keyEventToString(event);

    const def = SHORTCUT_DEFS.find(
      d => getEffectiveKey(d.id) === combo
    );

    if (!def) return;

    event.preventDefault();
    def.run();
  }
);

/* ---------- Aba Atalhos: exibir + remapear ---------- */

function renderShortcutsTab() {
  const list = document.getElementById(
    "shortcutsList"
  );

  if (!list) return;

  list.innerHTML = "";

  SHORTCUT_DEFS.forEach(def => {
    const row =
      document.createElement("div");

    row.className = "shortcut-row";

    const label =
      document.createElement("span");

    label.textContent = def.label;

    const key =
      document.createElement("button");

    key.type = "button";
    key.className = "shortcut-key";
    key.textContent = keyLabel(
      getEffectiveKey(def.id)
    );
    key.title =
      "Clique para trocar a tecla";

    key.addEventListener(
      "click",
      () => startRemap(def.id, key)
    );

    row.appendChild(label);
    row.appendChild(key);

    list.appendChild(row);
  });
}

function startRemap(id, keyEl) {
  if (remappingId) return;

  remappingId = id;

  const previousText =
    keyEl.textContent;

  keyEl.textContent = "Pressione uma tecla…";
  keyEl.classList.add("listening");

  function finish() {
    remappingId = null;
    keyEl.classList.remove("listening");

    document.removeEventListener(
      "keydown",
      captureKey,
      true
    );
  }

  async function captureKey(event) {
    event.preventDefault();
    event.stopPropagation();

    const rawKey =
      event.key.toLowerCase();

    if (isModifierKey(rawKey)) {
      /*
        Só um modificador sozinho (Ctrl, Shift...) —
        espera a tecla de verdade.
      */
      return;
    }

    if (rawKey === "escape") {
      /*
        Esc durante a gravação cancela a troca,
        em vez de virar a nova tecla.
      */
      keyEl.textContent = previousText;
      finish();
      return;
    }

    const combo =
      keyEventToString(event);

    const conflict = SHORTCUT_DEFS.find(
      d =>
        d.id !== id &&
        getEffectiveKey(d.id) === combo
    );

    if (conflict) {
      keyEl.textContent = previousText;
      finish();

      await showAlert(
        `A tecla "${keyLabel(combo)}" já está em uso por "${conflict.label}". Escolha outra tecla.`
      );
      return;
    }

    shortcutOverrides[id] = combo;
    saveShortcutOverrides();

    keyEl.textContent = keyLabel(combo);
    finish();
  }

  document.addEventListener(
    "keydown",
    captureKey,
    true
  );
}

function bindShortcutsTab() {
  const resetBtn =
    document.getElementById(
      "resetShortcutsBtn"
    );

  if (!resetBtn) return;

  resetBtn.addEventListener(
    "click",
    () => {
      shortcutOverrides = {};
      saveShortcutOverrides();
      renderShortcutsTab();
    }
  );
}
