/* ============================================================
   BLOCOS
   ============================================================ */

/*
  A área de trabalho é bem maior que a parte visível do
  board — cada lado ganha 2x o tamanho da tela como margem
  extra, então dá pra arrastar bem para fora do que está
  visível sem esbarrar numa "parede". Combina com o zoom
  para navegar por um mapa bem mais espaçoso.
*/
const WORLD_MARGIN_RATIO = 2;

/*
  Cache id -> elemento DOM. Evita um document.querySelector
  por bloco a cada frame de animação (60x por segundo) —
  é reconstruído toda vez que render() recria os elementos.
*/
let nodeElementCache = new Map();

function createNodeElement(node) {
  const element =
    document.createElement("article");

  element.className = "node";

  if (node.large) {
    element.classList.add("large");
  }

  if (
    node.id === AppState.selectedId
  ) {
    element.classList.add("selected");
  } else if (
    AppState.selectedId
  ) {
    /*
      Todos os outros continuam na tela,
      apenas ficam transparentes.
    */
    element.classList.add("dimmed");
  }

  element.dataset.id = node.id;

  element.innerHTML = `
    <div class="title"></div>
    ${
      childrenOf(node.id).length
        ? '<span class="child-dot"></span>'
        : ""
    }
  `;

  element.querySelector(
    ".title"
  ).textContent = node.title;

  element.addEventListener(
    "pointerdown",
    onPointerDown
  );

  element.addEventListener(
    "click",
    event => {
      event.stopPropagation();

      selectNode(node.id);
    }
  );

  document
    .getElementById("canvas")
    .appendChild(element);

  nodeElementCache.set(
    node.id,
    element
  );
}

function render() {
  document
    .querySelectorAll(".node")
    .forEach(
      element => element.remove()
    );

  nodeElementCache.clear();

  visibleNodes().forEach(
    createNodeElement
  );

  updatePositions();
  drawConnections();
  updateSidebar();
}

function selectNode(id) {
  const node = getNode(id);

  if (!node) return;

  /*
    Clicar no bloco alterna a abertura dos filhos.
    Ao mesmo tempo, o bloco fica selecionado.

    Se clicar no filho, o filho permanece selecionado
    e os filhos dele podem ser abertos sem o pai sumir.
  */
  if (
    AppState.selectedId === id
  ) {
    node.childrenOpen =
      !node.childrenOpen;
  }

  AppState.selectedId = id;

  render();
  saveData(false);
}

function updatePositions() {
  if (nodeElementCache.size === 0) {
    return;
  }

  const board =
    document.getElementById(
      "board"
    );

  const now =
    performance.now() / 1000;

  const area =
    board.getBoundingClientRect();

  /*
    0% congela os blocos completamente (ficam parados
    exatamente na posição salva); 100% é o padrão;
    pode passar disso pra um efeito mais acentuado.
  */
  const wobbleScale =
    (currentMap()?.wobbleIntensity ??
      100) / 100;

  const wobbleSpeedScale =
    (currentMap()?.wobbleSpeed ??
      100) / 100;

  visibleNodes().forEach(node => {
    const element =
      nodeElementCache.get(node.id);

    if (!element) return;

    const ampX =
      (node.large ? 5 : 8) *
      wobbleScale;

    const ampY =
      (node.large ? 4 : 7) *
      wobbleScale;

    const speed =
      (node.speed || .55) *
      wobbleSpeedScale;

    let x =
      node.x * area.width +
      Math.sin(
        now * speed + node.phase
      ) * ampX;

    let y =
      node.y * area.height +
      Math.cos(
        now * speed * .83 +
        node.phase
      ) * ampY;

    const halfW =
      element.offsetWidth / 2 + 10;

    const halfH =
      element.offsetHeight / 2 + 10;

    const marginX =
      area.width * WORLD_MARGIN_RATIO;

    const marginY =
      area.height * WORLD_MARGIN_RATIO;

    x = clamp(
      x,
      halfW - marginX,
      area.width - halfW + marginX
    );

    y = clamp(
      y,
      halfH - marginY,
      area.height - halfH + marginY
    );

    /*
      "translate" é uma propriedade própria do CSS,
      separada de "transform" — não sofre reflow de
      layout (left/top forçam), só composição na GPU.
      Continua compatível com o scale() que .selected
      e .dimmed aplicam via "transform".
    */
    element.style.translate =
      `${x}px ${y}px`;
  });

  resolveVisibleOverlaps();
}

/*
  Retorna a "caixa" de um bloco em coordenadas locais do
  mapa (o mesmo espaço de node.x/node.y, independente do
  zoom atual). offsetWidth/offsetHeight já são
  zoom-independentes por natureza (refletem o layout, não
  o visual pós-transform).
*/
function getLocalRect(element) {
  const [x, y] = (
    element.style.translate ||
    "0px 0px"
  )
    .split(" ")
    .map(v => parseFloat(v) || 0);

  const halfW =
    element.offsetWidth / 2;

  const halfH =
    element.offsetHeight / 2;

  return {
    left: x - halfW,
    right: x + halfW,
    top: y - halfH,
    bottom: y + halfH,
    cx: x,
    cy: y
  };
}

function resolveVisibleOverlaps() {
  const elements = [
    ...nodeElementCache.values()
  ];

  if (elements.length < 2) {
    return;
  }

  /*
    Mantém os blocos afastados.
    Não altera o ponto lógico salvo no mapa;
    é apenas uma correção visual.

    Tudo aqui roda em coordenadas locais (não em pixels de
    tela), então o resultado é o mesmo não importa o quão
    afastado ou aproximado esteja o zoom.
  */
  for (
    let pass = 0;
    pass < 2;
    pass++
  ) {
    for (
      let i = 0;
      i < elements.length;
      i++
    ) {
      for (
        let j = i + 1;
        j < elements.length;
        j++
      ) {
        const a = getLocalRect(
          elements[i]
        );

        const b = getLocalRect(
          elements[j]
        );

        const gap =
          18 *
          (
            (currentMap()?.nodeSpacing || 60) /
            60
          );

        const overlapX =
          Math.min(
            a.right,
            b.right
          ) -
          Math.max(
            a.left,
            b.left
          );

        const overlapY =
          Math.min(
            a.bottom,
            b.bottom
          ) -
          Math.max(
            a.top,
            b.top
          );

        if (
          overlapX > -gap &&
          overlapY > -gap
        ) {
          const pushX =
            a.cx <= b.cx ? -1 : 1;

          const pushY =
            a.cy <= b.cy ? -1 : 1;

          if (
            overlapX < overlapY
          ) {
            moveElement(
              elements[i],
              pushX *
                (overlapX + gap) /
                2,
              0
            );

            moveElement(
              elements[j],
              -pushX *
                (overlapX + gap) /
                2,
              0
            );
          } else {
            moveElement(
              elements[i],
              0,
              pushY *
                (overlapY + gap) /
                2
            );

            moveElement(
              elements[j],
              0,
              -pushY *
                (overlapY + gap) /
                2
            );
          }
        }
      }
    }
  }
}

function moveElement(
  element,
  dx,
  dy
) {
  /*
    dx/dy agora já chegam em unidades locais (o mesmo
    espaço de node.x/node.y) — sem nenhuma conversão de
    zoom, então não tem como "explodir" em zooms extremos.
  */
  const [
    currentLeft,
    currentTop
  ] = (element.style.translate || "0px 0px")
    .split(" ")
    .map(v => parseFloat(v) || 0);

  const area =
    document
      .getElementById("board")
      .getBoundingClientRect();

  const marginX =
    area.width * WORLD_MARGIN_RATIO;

  const marginY =
    area.height * WORLD_MARGIN_RATIO;

  const x = clamp(
    currentLeft + dx,
    element.offsetWidth / 2 + 6 -
      marginX,
    area.width -
      element.offsetWidth / 2 -
      6 +
      marginX
  );

  const y = clamp(
    currentTop + dy,
    element.offsetHeight / 2 + 6 -
      marginY,
    area.height -
      element.offsetHeight / 2 -
      6 +
      marginY
  );

  element.style.translate =
    `${x}px ${y}px`;
}

function onPointerDown(event) {
  const id =
    event.currentTarget.dataset.id;

  const node = getNode(id);

  if (!node) return;

  /*
    Guarda o estado antes do arrasto começar,
    pra dar pra desfazer com Ctrl+Z depois.
  */
  pushHistory();

  const area =
    document
      .getElementById("board")
      .getBoundingClientRect();

  AppState.drag = {
    id,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startScreenX:
      parseFloat(
        (
          event.currentTarget.style
            .translate || "0px 0px"
        ).split(" ")[0]
      ) || 0,
    startScreenY:
      parseFloat(
        (
          event.currentTarget.style
            .translate || "0px 0px"
        ).split(" ")[1]
      ) || 0,
    areaW: area.width,
    areaH: area.height
  };

  event.currentTarget.setPointerCapture(
    event.pointerId
  );

  event.currentTarget.classList.add(
    "dragging"
  );
}

function handlePointerMove(event) {
  if (!AppState.drag) {
    return;
  }

  const element =
    nodeElementCache.get(
      AppState.drag.id
    );

  const node =
    getNode(AppState.drag.id);

  if (!element || !node) {
    return;
  }

  const area =
    document
      .getElementById("board")
      .getBoundingClientRect();

  /*
    O mouse se move em pixels de tela, mas o bloco vive
    no espaço lógico (pré-zoom) do #canvas. Convertemos
    o deslocamento pela escala atual do mapa.
  */
  const zoom =
    currentMap()?.zoom || 1;

  let x =
    AppState.drag.startScreenX +
    (
      event.clientX -
      AppState.drag.startX
    ) / zoom;

  let y =
    AppState.drag.startScreenY +
    (
      event.clientY -
      AppState.drag.startY
    ) / zoom;

  const marginX =
    area.width * WORLD_MARGIN_RATIO;

  const marginY =
    area.height * WORLD_MARGIN_RATIO;

  x = clamp(
    x,
    element.offsetWidth / 2 +
      8 -
      marginX,
    area.width -
      element.offsetWidth / 2 -
      8 +
      marginX
  );

  y = clamp(
    y,
    element.offsetHeight / 2 +
      8 -
      marginY,
    area.height -
      element.offsetHeight / 2 -
      8 +
      marginY
  );

  node.x =
    x / area.width;

  node.y =
    y / area.height;

  element.style.translate =
    `${x}px ${y}px`;
}

function handlePointerUp() {
  if (!AppState.drag) {
    return;
  }

  const element =
    nodeElementCache.get(
      AppState.drag.id
    );

  if (element) {
    element.classList.remove(
      "dragging"
    );
  }

  AppState.drag = null;

  touchMapEdited();
  saveData(false);
}

async function createChild() {
  const parentId =
    AppState.selectedId;

  if (!parentId) {
    await showAlert(
      "Selecione um bloco primeiro."
    );
    return;
  }

  const map = currentMap();

  if (!map) return;

  pushHistory();

  const child =
    createNodeData(
      parentId,
      "NOVO BLOCO",
      false
    );

  map.nodes.push(child);

  /*
    Criou filho -> o pai é aberto
    para que o novo bloco apareça.
  */
  const parent =
    getNode(parentId);

  parent.childrenOpen = true;

  AppState.selectedId =
    child.id;

  touchMapEdited();
  render();
  saveData();
}

/*
  Bloco irmão: mesmo pai do bloco selecionado.
  Se o selecionado for o bloco principal (sem pai),
  não existe "irmão" possível — cria um filho normal.
*/
async function createSibling() {
  if (!AppState.selectedId) {
    await showAlert(
      "Selecione um bloco primeiro."
    );
    return;
  }

  const selected =
    getNode(AppState.selectedId);

  if (!selected) return;

  if (!selected.parentId) {
    return createChild();
  }

  const map = currentMap();

  if (!map) return;

  pushHistory();

  const sibling =
    createNodeData(
      selected.parentId,
      "NOVO BLOCO",
      false
    );

  map.nodes.push(sibling);

  const parent =
    getNode(selected.parentId);

  if (parent) {
    parent.childrenOpen = true;
  }

  AppState.selectedId =
    sibling.id;

  touchMapEdited();
  render();
  saveData();
}

async function deleteSelectedNode() {
  try {
    await deleteSelectedNodeInner();
  } catch (error) {
    console.error(
      "Falha ao excluir bloco:",
      error
    );

    await showAlert(
      "Não foi possível excluir o bloco. Veja o console (F12) para detalhes."
    );
  }
}

async function deleteSelectedNodeInner() {
  if (!AppState.selectedId) {
    await showAlert(
      "Selecione um bloco para excluir."
    );
    return;
  }

  const map = currentMap();

  const target =
    getNode(AppState.selectedId);

  if (!map || !target) return;

  /*
    O bloco principal é único e não pode
    ser substituído por um novo bloco.
    Se o usuário quiser apagar o mapa inteiro,
    usa a lista de mapas.
  */
  if (!target.parentId) {
    await showAlert(
      "O bloco principal não pode ser excluído. Exclua o mapa mental pela lista de mapas."
    );
    return;
  }

  const descendants =
    getDescendants(target.id);

  const ids = new Set([
    target.id,
    ...descendants
  ]);

  const count = ids.size;

  const message =
    count > 1
      ? `Excluir "${target.title}" e seus ${count - 1} descendente(s)?`
      : `Excluir "${target.title}"?`;

  const confirmed =
    await showConfirm(message);

  if (!confirmed) {
    return;
  }

  pushHistory();

  map.nodes =
    map.nodes.filter(
      node => !ids.has(node.id)
    );

  map.connections =
    map.connections.filter(
      connection =>
        !ids.has(connection[0]) &&
        !ids.has(connection[1])
    );

  AppState.selectedId = null;

  touchMapEdited();
  render();
  saveData();
}

/*
  Ctrl+D: duplica o bloco selecionado (só ele, não os
  filhos) como um novo irmão, logo ao lado.
*/
async function duplicateSelectedNode() {
  if (!AppState.selectedId) {
    await showAlert(
      "Selecione um bloco primeiro."
    );
    return;
  }

  const map = currentMap();

  const original =
    getNode(AppState.selectedId);

  if (!map || !original) return;

  if (!original.parentId) {
    await showAlert(
      "O bloco principal não pode ser duplicado."
    );
    return;
  }

  pushHistory();

  const copy = createNodeData(
    original.parentId,
    original.title,
    false
  );

  copy.note = original.note;

  copy.x = clamp(
    original.x + .04,
    .05,
    .95
  );

  copy.y = clamp(
    original.y + .04,
    .05,
    .95
  );

  map.nodes.push(copy);

  const parent =
    getNode(original.parentId);

  if (parent) {
    parent.childrenOpen = true;
  }

  AppState.selectedId = copy.id;

  touchMapEdited();
  render();
  saveData();
}

/*
  C: abre/fecha os filhos do bloco selecionado
  sem precisar clicar nele de novo.
*/
function toggleSelectedChildren() {
  if (!AppState.selectedId) return;

  const node =
    getNode(AppState.selectedId);

  if (!node) return;

  node.childrenOpen =
    !node.childrenOpen;

  render();
  saveData(false);
}

/*
  Esc: desseleciona o bloco atual.
*/
function deselectAll() {
  AppState.selectedId = null;

  render();
}

/*
  Ctrl+K: abre a aba Mapas e foca a busca.
*/
function focusMapSearch() {
  const panel =
    document.getElementById(
      "mapsPanel"
    );

  if (panel) {
    panel.classList.remove("closed");
  }

  switchPanelTab("mapas");

  const input =
    document.getElementById(
      "mapSearchInput"
    );

  if (input) {
    input.focus();
    input.select();
  }
}

/*
  Espaço: centraliza a câmera. Se houver um bloco
  selecionado, centraliza nele; senão, volta ao
  centro do mapa (mantendo o zoom atual).
*/
function centerView() {
  const map = currentMap();

  if (!map) return;

  const board =
    document
      .getElementById("board")
      .getBoundingClientRect();

  const zoom = map.zoom || 1;

  const selected =
    AppState.selectedId
      ? getNode(AppState.selectedId)
      : null;

  if (selected) {
    const localX =
      selected.x * board.width;

    const localY =
      selected.y * board.height;

    map.panX =
      board.width / 2 -
      localX * zoom;

    map.panY =
      board.height / 2 -
      localY * zoom;
  } else {
    map.panX = 0;
    map.panY = 0;
  }

  updateZoomUI();
  updatePositions();
  drawConnections();
  saveData(false);
}

/*
  G: alterna a grade de fundo do board.
  É uma preferência do workspace, não de um mapa
  específico — fica guardada separadamente.
*/
function toggleGrid() {
  const board =
    document.getElementById("board");

  const on =
    board.classList.toggle("grid-on");

  localStorage.setItem(
    "mapa-grid",
    on ? "1" : "0"
  );
}

function loadGridPreference() {
  const board =
    document.getElementById("board");

  if (
    localStorage.getItem(
      "mapa-grid"
    ) === "1"
  ) {
    board.classList.add("grid-on");
  }
}
