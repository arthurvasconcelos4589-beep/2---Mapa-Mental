/* ============================================================
   EDITOR DE ANOTAÇÕES (RICO)
   Negrito, itálico, sublinhado, código em linha, cor de
   texto (paleta por tema) e um bloco de destaque estilo
   markdown. Fonte monoespaçada, então tudo continua alinhado
   em colunas e linhas mesmo com formatação aplicada.
   ============================================================ */

/*
  Cada posição da paleta tem um PAPEL fixo — não é só "a
  cor que fica ali", é "a cor de Erro", "a de Sucesso" etc.
  Trocar de tema muda o tom, mas o SENTIDO de cada cor se
  mantém, então o que você grifou continua fazendo sentido.
*/
const NOTE_COLOR_ROLES = [
  "Destaque",
  "Atenção / Erro",
  "Sucesso",
  "Aviso",
  "Informação",
  "Especial",
  "Técnico",
  "Secundário"
];

const TEXT_COLOR_PALETTES = {
  "dark-modern": [
    "#f5f5f5", "#ff5c5c", "#4ade80", "#fbbf24",
    "#60a5fa", "#c084fc", "#22d3ee", "#9ca3af"
  ],
  "dracula": [
    "#f8f8f2", "#ff5555", "#50fa7b", "#ffb86c",
    "#8be9fd", "#bd93f9", "#ff79c6", "#6272a4"
  ],
  "ultron": [
    "#e8e8ea", "#e0343f", "#4ade80", "#ff9f43",
    "#7dd3fc", "#f472b6", "#c4c5ca", "#8a8b90"
  ],
  "jarvis": [
    "#d8f4ff", "#ff5f5f", "#34d1a1", "#ffb347",
    "#2ee6ff", "#7fd4f0", "#4fa8d8", "#4f7c8c"
  ],
  "light-modern": [
    "#202124", "#b91c1c", "#15803d", "#92600b",
    "#1d3a8f", "#6d28d9", "#0f766e", "#64748b"
  ],
  "creme": [
    "#4a3323", "#b5533c", "#4b6b3f", "#a97d1f",
    "#2d4a6b", "#6b3f5e", "#5a6b6b", "#8d7355"
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

/*
  Link para outro bloco: o trecho vira [[nome]] e, ao clicar,
  leva até o bloco com esse nome. Com texto selecionado, ele vira
  o link; sem seleção, entra um texto de exemplo já selecionado,
  pra você digitar o nome por cima.
*/
function insertNoteLink() {
  const editor = getNoteEditor();

  editor.focus();

  const selection =
    window.getSelection();

  if (!selection.rangeCount) return;

  const range =
    selection.getRangeAt(0);

  if (
    !editor.contains(
      range.commonAncestorContainer
    )
  ) {
    return;
  }

  const link =
    document.createElement("span");

  link.className = "note-link";

  if (range.collapsed) {
    link.textContent = "nome do bloco";
    range.insertNode(link);
  } else {
    try {
      range.surroundContents(link);
    } catch (error) {
      /* Seleção cruza mais de um elemento — ignora. */
      return;
    }
  }

  /*
    Se o link ficou no fim da linha, um espaço depois dele
    garante que dá pra continuar escrevendo fora dele (tem que
    ser espaço não separável: um comum o navegador descarta).
  */
  if (!link.nextSibling) {
    link.after(
      document.createTextNode("\u00A0")
    );
  }

  const after =
    document.createRange();

  if (range.collapsed || link.textContent === "nome do bloco") {
    after.selectNodeContents(link);
  } else {
    after.setStartAfter(link);
    after.collapse(true);
  }

  selection.removeAllRanges();
  selection.addRange(after);

  triggerNoteSave();
}

/*
  Leva o cursor pra fora do link. Precisa ficar depois de um
  espaço de verdade: logo na borda do link o navegador o puxaria
  de volta pra dentro dele.
*/
function moveCaretOutOfLink(link) {
  let next = link.nextSibling;

  if (
    !next ||
    next.nodeType !== Node.TEXT_NODE
  ) {
    next = document.createTextNode(
      "\u00A0"
    );

    link.after(next);
  } else if (
    !/^[\s\u00A0]/.test(next.textContent)
  ) {
    next.textContent =
      "\u00A0" + next.textContent;
  }

  const outside =
    document.createRange();

  outside.setStart(next, 1);
  outside.collapse(true);

  const selection =
    window.getSelection();

  selection.removeAllRanges();
  selection.addRange(outside);
}

/*
  Digitar "[[" cria um link, igual ao botão [[ ]]. Como o "[" já
  fecha sozinho com "]", some com o par antes de criar o link.
*/
function handleNoteLinkTrigger(event) {
  if (event.key !== "[") return false;

  const selection =
    window.getSelection();

  if (
    !selection ||
    !selection.rangeCount ||
    !selection.isCollapsed
  ) {
    return false;
  }

  const node = selection.anchorNode;

  if (
    node.nodeType !== Node.TEXT_NODE ||
    getCaretLink()
  ) {
    return false;
  }

  const offset = selection.anchorOffset;

  if (node.textContent[offset - 1] !== "[") {
    return false;
  }

  event.preventDefault();

  if (node.textContent[offset] === "]") {
    node.deleteData(offset, 1);
  }

  node.deleteData(offset - 1, 1);

  const range = document.createRange();

  range.setStart(node, offset - 1);
  range.collapse(true);

  selection.removeAllRanges();
  selection.addRange(range);

  insertNoteLink();

  return true;
}

/* ---------- Autocompletar do link ---------- */

let linkSuggestMatches = [];
let linkSuggestIndex = 0;

function getLinkSuggestBox() {
  return document.getElementById(
    "noteLinkSuggest"
  );
}

/* O link em que o cursor está (sem texto selecionado), se houver. */
function getCaretLink() {
  const selection =
    window.getSelection();

  if (
    !selection ||
    !selection.rangeCount ||
    !selection.isCollapsed
  ) {
    return null;
  }

  const anchor = selection.anchorNode;

  const element =
    anchor.nodeType === Node.TEXT_NODE
      ? anchor.parentElement
      : anchor;

  const link =
    element?.closest(".note-link");

  return link &&
    getNoteEditor().contains(link)
    ? link
    : null;
}

function hideLinkSuggest() {
  getLinkSuggestBox().hidden = true;
  linkSuggestMatches = [];
}

function refreshLinkSuggest() {
  const link = getCaretLink();
  const map = currentMap();

  if (!link || !map) {
    hideLinkSuggest();
    return;
  }

  const query = normalizeSearchText(
    link.textContent.trim()
  );

  if (!query) {
    hideLinkSuggest();
    return;
  }

  /* Nome igual primeiro, depois começando com, depois contendo. */
  const rank = node => {
    const title = normalizeSearchText(
      (node.title || "").trim()
    );

    if (title === query) return 0;
    if (title.startsWith(query)) return 1;
    if (title.includes(query)) return 2;
    return 3;
  };

  linkSuggestMatches = map.nodes
    .map(node => ({
      node,
      rank: rank(node)
    }))
    .filter(item => item.rank < 3)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 8)
    .map(item => item.node);

  if (linkSuggestMatches.length === 0) {
    hideLinkSuggest();
    return;
  }

  linkSuggestIndex = 0;

  renderLinkSuggest(link);
}

function renderLinkSuggest(link) {
  const box = getLinkSuggestBox();

  box.innerHTML = "";

  linkSuggestMatches.forEach(
    (node, index) => {
      const parent = node.parentId
        ? getNode(node.parentId)
        : null;

      const item =
        document.createElement("div");

      item.className =
        "note-link-suggest-item" +
        (index === linkSuggestIndex
          ? " active"
          : "");

      const title =
        document.createElement("span");

      title.className =
        "note-link-suggest-title";

      title.textContent = node.title;

      const meta =
        document.createElement("span");

      meta.className =
        "note-link-suggest-meta";

      meta.textContent = parent
        ? `dentro de: ${parent.title}`
        : "bloco principal";

      item.appendChild(title);
      item.appendChild(meta);

      /* Não tira o foco do campo de anotação. */
      item.addEventListener(
        "mousedown",
        event => event.preventDefault()
      );

      item.addEventListener(
        "click",
        () => acceptLinkSuggestion(index)
      );

      box.appendChild(item);
    }
  );

  box.hidden = false;

  /* Embaixo do link; se não couber, em cima. */
  const rect =
    link.getBoundingClientRect();

  const left = Math.max(
    8,
    Math.min(
      rect.left,
      window.innerWidth -
        box.offsetWidth -
        8
    )
  );

  const top =
    rect.bottom +
      4 +
      box.offsetHeight >
    window.innerHeight
      ? rect.top - box.offsetHeight - 4
      : rect.bottom + 4;

  box.style.left = `${left}px`;
  box.style.top = `${Math.max(8, top)}px`;
}

function moveLinkSuggest(step) {
  const total =
    linkSuggestMatches.length;

  linkSuggestIndex =
    (linkSuggestIndex + step + total) %
    total;

  getLinkSuggestBox()
    .querySelectorAll(
      ".note-link-suggest-item"
    )
    .forEach((item, index) => {
      item.classList.toggle(
        "active",
        index === linkSuggestIndex
      );

      if (index === linkSuggestIndex) {
        item.scrollIntoView({
          block: "nearest"
        });
      }
    });
}

/* Escreve o nome exato do bloco no link e sai dele. */
function acceptLinkSuggestion(index) {
  const node =
    linkSuggestMatches[index];

  const link = getCaretLink();

  if (!node || !link) return;

  link.textContent = node.title;

  hideLinkSuggest();

  moveCaretOutOfLink(link);

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

/*
  Aplica a cor pelo ÍNDICE na paleta (não pelo valor
  hexadecimal). Assim, se o tema mudar depois, o texto
  automaticamente passa a usar a cor que estiver naquela
  mesma posição na paleta do novo tema — a variável CSS é
  quem resolve isso, não precisa reprocessar o texto.
*/
function applyNoteColor(index) {
  const editor = getNoteEditor();

  editor.focus();

  const selection =
    window.getSelection();

  if (
    !selection.rangeCount ||
    selection.isCollapsed
  ) {
    closeNoteColorPopover();
    return;
  }

  const range =
    selection.getRangeAt(0);

  const span =
    document.createElement("span");

  span.className =
    `note-color-${index}`;

  try {
    range.surroundContents(span);
  } catch (error) {
    /*
      Seleção cruza mais de um elemento — move o conteúdo
      pro span em vez de "envolver" a range diretamente.
    */
    const fragment =
      range.extractContents();

    span.appendChild(fragment);
    range.insertNode(span);
  }

  selection.removeAllRanges();

  document.getElementById(
    "noteColorSwatch"
  ).style.background =
    `var(--note-color-${index})`;

  closeNoteColorPopover();
  triggerNoteSave();
}

function renderNoteColorPopover() {
  const popover =
    document.getElementById(
      "noteColorPopover"
    );

  popover.innerHTML = "";

  getThemeColorPalette().forEach(
    (color, index) => {
      const swatch =
        document.createElement(
          "button"
        );

      swatch.type = "button";
      swatch.className =
        "note-color-option";
      swatch.style.background = color;
      swatch.title =
        NOTE_COLOR_ROLES[index] ||
        color;

      swatch.addEventListener(
        "click",
        event => {
          event.stopPropagation();
          applyNoteColor(index);
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

/*
  Fechamento automático de pares, tipo VSCode: abrir um
  ( { [ " ' ` já insere o par e deixa o cursor no meio.
*/
const NOTE_AUTO_PAIRS = {
  "(": ")",
  "{": "}",
  "[": "]",
  '"': '"',
  "'": "'",
  "`": "`"
};

const NOTE_AUTO_CLOSERS = Object.values(
  NOTE_AUTO_PAIRS
);

function handleNoteTypeOverClosing(
  event
) {
  if (
    !NOTE_AUTO_CLOSERS.includes(
      event.key
    )
  ) {
    return false;
  }

  const selection =
    window.getSelection();

  if (
    !selection ||
    !selection.isCollapsed ||
    !selection.rangeCount
  ) {
    return false;
  }

  const range =
    selection.getRangeAt(0);

  const container =
    range.startContainer;

  const offset = range.startOffset;

  if (
    container.nodeType ===
      Node.TEXT_NODE &&
    container.textContent[
      offset
    ] === event.key
  ) {
    /*
      O próximo caractere já é o fechamento que acabamos
      de digitar (provavelmente o que auto-completamos) —
      só pula por cima em vez de duplicar.
    */
    event.preventDefault();

    range.setStart(
      container,
      offset + 1
    );

    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);

    return true;
  }

  return false;
}

function handleNoteAutoPair(event) {
  const closing =
    NOTE_AUTO_PAIRS[event.key];

  if (!closing) return false;

  event.preventDefault();

  const selection =
    window.getSelection();

  if (
    selection &&
    !selection.isCollapsed &&
    selection.rangeCount
  ) {
    /*
      Tem texto selecionado: envolve a seleção com o par,
      em vez de substituir.
    */
    const text = selection
      .getRangeAt(0)
      .toString();

    document.execCommand(
      "insertText",
      false,
      event.key + text + closing
    );
  } else {
    document.execCommand(
      "insertText",
      false,
      event.key + closing
    );

    const sel =
      window.getSelection();

    if (sel.rangeCount) {
      const range =
        sel.getRangeAt(0);

      range.setStart(
        range.startContainer,
        range.startOffset - 1
      );

      range.collapse(true);

      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  triggerNoteSave();
  return true;
}

/*
  Enter dentro de um bloco de destaque continua DENTRO do
  mesmo bloco (só quebra a linha), em vez de o navegador
  cortar em outro bloco separado — o que deixava uma
  "linha" estranha cortando a caixa ao meio.
*/
function isInsideNoteBlock(node) {
  const editor = getNoteEditor();

  let el =
    node.nodeType === Node.TEXT_NODE
      ? node.parentElement
      : node;

  while (el && el !== editor) {
    if (
      el.classList &&
      el.classList.contains(
        "note-block"
      )
    ) {
      return true;
    }

    el = el.parentElement;
  }

  return false;
}

function handleNoteBlockEnter(
  event
) {
  if (event.key !== "Enter") {
    return false;
  }

  const selection =
    window.getSelection();

  if (
    !selection ||
    !selection.rangeCount
  ) {
    return false;
  }

  const range =
    selection.getRangeAt(0);

  if (
    !isInsideNoteBlock(
      range.startContainer
    )
  ) {
    return false;
  }

  event.preventDefault();

  document.execCommand(
    "insertLineBreak"
  );

  triggerNoteSave();

  return true;
}

function handleNoteAutoPairsKeydown(
  event
) {
  if (handleNoteBlockEnter(event)) {
    return;
  }

  if (
    event.ctrlKey ||
    event.metaKey ||
    event.altKey
  ) {
    return;
  }

  if (handleNoteLinkTrigger(event)) {
    return;
  }

  if (handleNoteTypeOverClosing(event)) {
    return;
  }

  handleNoteAutoPair(event);
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
    .getElementById("noteLinkBtn")
    .addEventListener(
      "click",
      insertNoteLink
    );

  /*
    Autocompletar: a lista aparece enquanto você digita dentro
    de um link. Capturamos as teclas antes dos outros atalhos
    do editor (Enter e Tab teriam outro uso).
  */
  const noteEditor = getNoteEditor();

  noteEditor.addEventListener(
    "input",
    refreshLinkSuggest
  );

  noteEditor.addEventListener(
    "blur",
    hideLinkSuggest
  );

  document.addEventListener(
    "selectionchange",
    () => {
      if (
        !getLinkSuggestBox().hidden &&
        !getCaretLink()
      ) {
        hideLinkSuggest();
      }
    }
  );

  noteEditor.addEventListener(
    "keydown",
    event => {
      if (
        getLinkSuggestBox().hidden ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      ) {
        return;
      }

      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp"
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();

        moveLinkSuggest(
          event.key === "ArrowDown"
            ? 1
            : -1
        );
      } else if (
        event.key === "Enter" ||
        event.key === "Tab"
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();

        acceptLinkSuggestion(
          linkSuggestIndex
        );
      } else if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();

        hideLinkSuggest();
      }
    },
    true
  );

  /* Clique num link leva até o bloco. */
  getNoteEditor().addEventListener(
    "click",
    event => {
      const link =
        event.target.closest(
          ".note-link"
        );

      if (link) {
        goToLinkedBlock(link.textContent);
      }
    }
  );

  /*
    Seta → no fim do link leva o cursor pra fora dele. Sem isso
    o navegador continua "dentro" do link e o texto seguinte
    viraria parte do nome.
  */
  getNoteEditor().addEventListener(
    "keydown",
    event => {
      if (
        event.key !== "ArrowRight" ||
        event.shiftKey ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey
      ) {
        return;
      }

      const selection =
        window.getSelection();

      if (
        !selection.rangeCount ||
        !selection.isCollapsed
      ) {
        return;
      }

      const anchor = selection.anchorNode;

      const link = (
        anchor.nodeType === Node.TEXT_NODE
          ? anchor.parentElement
          : anchor
      )?.closest(".note-link");

      if (!link) return;

      /* Só age se não sobrar texto do link depois do cursor. */
      const caret =
        selection.getRangeAt(0);

      const tail =
        document.createRange();

      tail.setStart(
        caret.startContainer,
        caret.startOffset
      );

      tail.setEnd(
        link,
        link.childNodes.length
      );

      if (tail.toString() !== "") {
        return;
      }

      event.preventDefault();

      moveCaretOutOfLink(link);
    }
  );

  document
    .getElementById("noteBlockBtn")
    .addEventListener(
      "click",
      insertNoteBlock
    );

  document
    .getElementById(
      "noteOrderedListBtn"
    )
    .addEventListener("click", () =>
      execNoteCommand(
        "insertOrderedList"
      )
    );

  document
    .getElementById(
      "noteUnorderedListBtn"
    )
    .addEventListener("click", () =>
      execNoteCommand(
        "insertUnorderedList"
      )
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
    Fechamento automático de pares — checa antes dos
    atalhos, já que não há sobreposição de teclas entre
    os dois sistemas.
  */
  editor.addEventListener(
    "keydown",
    handleNoteAutoPairsKeydown
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
