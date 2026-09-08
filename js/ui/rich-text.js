/* ============================================================
   EDITOR DE ANOTAÇÕES (RICO)
   Negrito, itálico, sublinhado, código em linha, cor de
   texto (paleta por tema) e um bloco de destaque estilo
   markdown. Fonte monoespaçada, então tudo continua alinhado
   em colunas e linhas mesmo com formatação aplicada.
   ============================================================ */

const TEXT_COLOR_PALETTES = {
  "dark-modern": [
    "#f5f5f5", "#ff6b6b", "#ffa94d", "#ffd43b",
    "#69db7c", "#66d9e8", "#74c0fc", "#b197fc"
  ],
  "dracula": [
    "#f8f8f2", "#ff79c6", "#bd93f9", "#8be9fd",
    "#50fa7b", "#ffb86c", "#ff5555", "#f1fa8c"
  ],
  "ultron": [
    "#e8e8ea", "#ff6b6b", "#e0343f", "#ff9f43",
    "#c4c5ca", "#8a8b90", "#d4af37", "#b7202b"
  ],
  "jarvis": [
    "#d8f4ff", "#2ee6ff", "#7fd4f0", "#4fa8d8",
    "#34d1a1", "#ffb347", "#ff5f5f", "#bfe9f7"
  ],
  "light-modern": [
    "#202124", "#1d3a8f", "#0f766e", "#15803d",
    "#92600b", "#b91c1c", "#6d28d9", "#334155"
  ],
  "creme": [
    "#4a3323", "#b5533c", "#a97d1f", "#3f6b3f",
    "#6b3f5e", "#2d4a6b", "#7a4b25", "#8d7355"
  ]
};

const NOTE_INDENT_SIZE = 3;

function getThemeColorPalette() {
  const theme =
    document.documentElement.dataset
      .theme || "dark-modern";

  return (
    TEXT_COLOR_PALETTES[theme] ||
    TEXT_COLOR_PALETTES["dark-modern"]
  );
}

function getNoteEditor() {
  return document.getElementById(
    "note"
  );
}

function triggerNoteSave() {
  getNoteEditor().dispatchEvent(
    new Event("input", {
      bubbles: true
    })
  );
}

function execNoteCommand(
  command,
  value = null
) {
  getNoteEditor().focus();
  document.execCommand(
    command,
    false,
    value
  );

  triggerNoteSave();
  updateNoteToolbarState();
}

/*
  Código em linha: só o trecho selecionado ganha destaque
  (diferente do bloco, que toma a linha inteira).
*/
function insertInlineCode() {
  const editor = getNoteEditor();

  editor.focus();

  const selection =
    window.getSelection();

  if (
    !selection.rangeCount ||
    selection.isCollapsed
  ) {
    return;
  }

  const range =
    selection.getRangeAt(0);

  const code =
    document.createElement("code");

  code.className = "note-inline-code";

  try {
    range.surroundContents(code);
  } catch (error) {
    /*
      Seleção cruza mais de um elemento —
      simplesmente ignora, sem quebrar nada.
    */
    return;
  }

  selection.removeAllRanges();
  triggerNoteSave();
}

function clearNoteFormatting() {
  getNoteEditor().focus();
  document.execCommand("removeFormat");
  triggerNoteSave();
}

/*
  Bloco de destaque (markdown): se a linha atual estiver
  vazia, o bloco toma o lugar dela; se tiver conteúdo,
  pula pra uma linha nova antes de criar o bloco.
*/
function insertNoteBlock() {
  const editor = getNoteEditor();

  editor.focus();

  const selection =
    window.getSelection();

  if (!selection.rangeCount) {
    return;
  }

  const range =
    selection.getRangeAt(0);

  let node = range.startContainer;

  while (
    node &&
    node.parentNode !== editor &&
    node !== editor
  ) {
    node = node.parentNode;
  }

  const currentLine =
    node && node !== editor
      ? node
      : null;

  const block =
    document.createElement("div");

  block.className = "note-block";

  if (
    currentLine &&
    currentLine.textContent.trim() ===
      ""
  ) {
    editor.replaceChild(
      block,
      currentLine
    );
  } else if (currentLine) {
    currentLine.after(block);
  } else {
    editor.appendChild(block);
  }

  const newRange =
    document.createRange();

  newRange.selectNodeContents(block);
  newRange.collapse(true);

  selection.removeAllRanges();
  selection.addRange(newRange);

  triggerNoteSave();
}

function applyNoteColor(color) {
  execNoteCommand("foreColor", color);

  document.getElementById(
    "noteColorSwatch"
  ).style.background = color;

  closeNoteColorPopover();
}

function renderNoteColorPopover() {
  const popover =
    document.getElementById(
      "noteColorPopover"
    );

  popover.innerHTML = "";

  getThemeColorPalette().forEach(
    color => {
      const swatch =
        document.createElement(
          "button"
        );

      swatch.type = "button";
      swatch.className =
        "note-color-option";
      swatch.style.background = color;
      swatch.title = color;

      swatch.addEventListener(
        "click",
        event => {
          event.stopPropagation();
          applyNoteColor(color);
        }
      );

      popover.appendChild(swatch);
    }
  );
}

function toggleNoteColorPopover() {
  const popover =
    document.getElementById(
      "noteColorPopover"
    );

  popover.hidden = !popover.hidden;
}

function closeNoteColorPopover() {
  document.getElementById(
    "noteColorPopover"
  ).hidden = true;
}

function updateNoteToolbarState() {
  const commandsByButton = {
    noteBoldBtn: "bold",
    noteItalicBtn: "italic",
    noteUnderlineBtn: "underline"
  };

  Object.entries(
    commandsByButton
  ).forEach(([id, command]) => {
    const btn =
      document.getElementById(id);

    let active = false;

    try {
      active =
        document.queryCommandState(
          command
        );
    } catch (error) {
      active = false;
    }

    btn.classList.toggle(
      "active",
      active
    );
  });
}

/*
  Tab (ou a tecla que o usuário reatribuir na aba Atalhos)
  insere alguns espaços em vez de sair do campo de texto.
*/
function insertNoteIndent() {
  document.execCommand(
    "insertText",
    false,
    " ".repeat(NOTE_INDENT_SIZE)
  );

  triggerNoteSave();
}

function bindNoteToolbar() {
  document
    .getElementById("noteBoldBtn")
    .addEventListener("click", () =>
      execNoteCommand("bold")
    );

  document
    .getElementById("noteItalicBtn")
    .addEventListener("click", () =>
      execNoteCommand("italic")
    );

  document
    .getElementById(
      "noteUnderlineBtn"
    )
    .addEventListener("click", () =>
      execNoteCommand("underline")
    );

  document
    .getElementById(
      "noteInlineCodeBtn"
    )
    .addEventListener(
      "click",
      insertInlineCode
    );

  document
    .getElementById("noteBlockBtn")
    .addEventListener(
      "click",
      insertNoteBlock
    );

  document
    .getElementById("noteColorBtn")
    .addEventListener(
      "click",
      event => {
        event.stopPropagation();
        renderNoteColorPopover();
        toggleNoteColorPopover();
      }
    );

  document.addEventListener(
    "click",
    event => {
      const picker =
        document.querySelector(
          ".note-color-picker"
        );

      if (
        picker &&
        !picker.contains(
          event.target
        )
      ) {
        closeNoteColorPopover();
      }
    }
  );

  const editor = getNoteEditor();

  editor.addEventListener(
    "keyup",
    updateNoteToolbarState
  );

  editor.addEventListener(
    "mouseup",
    updateNoteToolbarState
  );

  /*
    Atalhos específicos do editor (como o Tab de indentar)
    são resolvidos aqui, contra a mesma lista configurável
    usada na aba Atalhos.
  */
  editor.addEventListener(
    "keydown",
    event => {
      if (remappingId) return;

      const combo =
        keyEventToString(event);

      const def = SHORTCUT_DEFS.find(
        d =>
          d.context === "editor" &&
          getEffectiveKey(d.id) ===
            combo
      );

      if (!def) return;

      event.preventDefault();
      def.run();
    }
  );
}
