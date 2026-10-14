/* ============================================================
   ZOOM
   ============================================================ */

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 7.5;

/*
  Quanto cada giro da roda do mouse (ou clique em − / +) muda
  o zoom. É a "sensibilidade" ajustável na barra de zoom
  (padrão 5%). Por isso é "let" e não "const".
*/
let ZOOM_STEP = 0.05;

/* Zoom aplicado ao focar num bloco. */
const FOCUS_ZOOM = 1.2;

const ZOOM_SENSITIVITY_KEY =
  "mapa-zoom-sensitivity";

const ZOOM_ON_SELECT_KEY =
  "mapa-zoom-on-select";

let zoomOnSelectEnabled = true;

/*
  O mapa tem um limite — enorme, mas não infinito (o mesmo
  tamanho que já limita o quanto dá pra arrastar um bloco,
  WORLD_MARGIN_RATIO). Se o zoom afastar o suficiente pra
  começar a mostrar área além dessa "parede", a câmera puxa
  suavemente de volta pro centro do mapa, aos poucos —
  puxão maior a cada passo de zoom, menor durante o arraste
  contínuo da tela.
*/
function applyWorldBoundaryPull(
  map,
  board,
  strength
) {
  const worldMultiplier =
    1 + 2 * WORLD_MARGIN_RATIO;

  const worldWidth =
    board.width * worldMultiplier;

  const worldHeight =
    board.height * worldMultiplier;

  const visibleWidth =
    board.width / map.zoom;

  const visibleHeight =
    board.height / map.zoom;

  if (
    visibleWidth <= worldWidth &&
    visibleHeight <= worldHeight
  ) {
    return;
  }

  const centeredPanX =
    (board.width / 2) *
    (1 - map.zoom);

  const centeredPanY =
    (board.height / 2) *
    (1 - map.zoom);

  map.panX +=
    (centeredPanX - map.panX) *
    strength;

  map.panY +=
    (centeredPanY - map.panY) *
    strength;
}

/*
  Zoom "de câmera de verdade": aproxima ou afasta a partir
  de um ponto específico (pivotX, pivotY, em pixels dentro
  do board), mantendo esse ponto fixo na tela. Por isso
  guardamos zoom E pan (panX/panY) juntos — não dá pra
  calcular um sem o outro.
*/
function setZoomAt(value, pivotX, pivotY) {
  const map = currentMap();

  if (!map) return;

  const board =
    document
      .getElementById("board")
      .getBoundingClientRect();

  const px =
    pivotX ?? board.width / 2;

  const py =
    pivotY ?? board.height / 2;

  const oldZoom = map.zoom || 1;
  const oldPanX = map.panX || 0;
  const oldPanY = map.panY || 0;

  const newZoom = clamp(
    Math.round(value * 100) / 100,
    MIN_ZOOM,
    MAX_ZOOM
  );

  /*
    Ponto do "mundo" (espaço local do canvas, antes da
    transformação) que está exatamente sob o pivô.
  */
  const worldX =
    (px - oldPanX) / oldZoom;

  const worldY =
    (py - oldPanY) / oldZoom;

  map.zoom = newZoom;

  /*
    Recalcula o deslocamento para que esse mesmo ponto do
    mundo continue exatamente sob o pivô depois do zoom.
  */
  map.panX = px - worldX * newZoom;
  map.panY = py - worldY * newZoom;

  applyWorldBoundaryPull(
    map,
    board,
    .18
  );

  updateZoomUI();
  updatePositions();
  drawConnections();
}

function changeZoomAt(
  delta,
  pivotX,
  pivotY
) {
  const map = currentMap();

  if (!map) return;

  setZoomAt(
    (map.zoom || 1) + delta,
    pivotX,
    pivotY
  );
}

/*
  Zoom pelos botões: sempre a partir do centro do board.
*/
function changeZoom(delta) {
  changeZoomAt(delta);
}

function resetZoom() {
  const map = currentMap();

  if (!map) return;

  map.zoom = 1;
  map.panX = 0;
  map.panY = 0;

  updateZoomUI();
  updatePositions();
  drawConnections();
}

function updateZoomUI() {
  const map = currentMap();

  const value =
    map?.zoom || 1;

  document.getElementById(
    "zoomValue"
  ).textContent =
    `${Math.round(value * 100)}%`;

  applyZoomTransform();
}

/*
  Durante o scroll do mouse, o pan e o zoom mudam a cada
  evento. Se a transição suave do CSS ficar ativa nesse
  momento, os eventos rápidos do scroll entram em fila e
  o movimento fica truncado/atrasado. Por isso o scroll
  aplica o zoom instantaneamente; os botões continuam com
  a transição suave.
*/
function setZoomTransitionInstant(
  instant
) {
  const canvas =
    document.getElementById("canvas");

  if (!canvas) return;

  canvas.style.transitionDuration =
    instant ? "0s" : "";
}

/*
  Escala e desloca o "mundo" inteiro (#canvas), não cada
  bloco individualmente. Assim, ao aproximar ou afastar,
  a distância entre os blocos muda junto com o tamanho,
  como uma câmera de verdade.
*/
function applyZoomTransform() {
  const canvas =
    document.getElementById("canvas");

  if (!canvas) return;

  const map = currentMap();

  const zoom = map?.zoom || 1;
  const panX = map?.panX || 0;
  const panY = map?.panY || 0;

  canvas.style.transformOrigin =
    "0 0";

  canvas.style.transform =
    `translate(${panX}px, ${panY}px) scale(${zoom})`;
}

/*
  Segurar o mouse numa área VAZIA do board (não em cima de
  um bloco, nem de um botão) e arrastar move a câmera —
  como arrastar uma mesa de verdade. Clicar em um bloco
  continua arrastando o bloco normalmente.
*/
function onBoardPointerDown(event) {
  if (
    event.target.id !== "board" &&
    event.target.id !== "canvas"
  ) {
    return;
  }

  /*
    Modo de posicionamento: este clique decide onde o
    bloco novo nasce, em vez de começar a arrastar a tela.
  */
  if (pendingNodeCreation) {
    placePendingNodeAt(
      event.clientX,
      event.clientY
    );
    return;
  }

  const map = currentMap();

  if (!map) return;

  AppState.boardPan = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startPanX: map.panX || 0,
    startPanY: map.panY || 0
  };

  const board =
    document.getElementById("board");

  board.setPointerCapture(
    event.pointerId
  );

  board.classList.add("panning");
}

function handleBoardPan(event) {
  if (!AppState.boardPan) return;

  const map = currentMap();

  if (!map) return;

  map.panX =
    AppState.boardPan.startPanX +
    (event.clientX -
      AppState.boardPan.startX);

  map.panY =
    AppState.boardPan.startPanY +
    (event.clientY -
      AppState.boardPan.startY);

  const board =
    document
      .getElementById("board")
      .getBoundingClientRect();

  applyWorldBoundaryPull(
    map,
    board,
    .06
  );

  setZoomTransitionInstant(true);
  applyZoomTransform();
}

function endBoardPan() {
  if (!AppState.boardPan) return;

  AppState.boardPan = null;

  document
    .getElementById("board")
    .classList.remove("panning");

  saveData(false);
}

/* ============================================================
   FOCAR NO BLOCO SELECIONADO
   ============================================================ */

/*
  Leva a câmera até o bloco selecionado, com zoom de 120%, e
  fecha a barra de configurações (esquerda) se estiver aberta.
  O bloco fica centralizado na área livre da tela (descontando
  a barra de anotação, se estiver aberta). Não "prende": é só um
  movimento — depois dele a câmera é sua de novo.
*/
function focusSelectedNode() {
  const map = currentMap();

  const node =
    AppState.selectedId
      ? getNode(AppState.selectedId)
      : null;

  if (!map || !node) return;

  const mapsPanel =
    document.getElementById(
      "mapsPanel"
    );

  if (
    !mapsPanel.classList.contains(
      "closed"
    )
  ) {
    mapsPanel.classList.add("closed");

    updateSidebarWidthVars();
    resizeBoard();
  }

  const board =
    document
      .getElementById("board")
      .getBoundingClientRect();

  const notesPanel =
    document.getElementById(
      "notesPanel"
    );

  const notesWidth =
    notesPanel.classList.contains(
      "closed"
    )
      ? 0
      : notesPanel.offsetWidth;

  const centerX =
    (board.width - notesWidth) / 2;

  const centerY =
    board.height / 2;

  map.zoom = FOCUS_ZOOM;

  map.panX =
    centerX -
    node.x * board.width * FOCUS_ZOOM;

  map.panY =
    centerY -
    node.y * board.height * FOCUS_ZOOM;

  /*
    O scroll do mouse deixa a transição desligada; aqui
    queremos o movimento suave da câmera.
  */
  setZoomTransitionInstant(false);

  updateZoomUI();
  updatePositions();
  drawConnections();
  saveData(false);
}

/*
  Zoom automático: só acontece com a barra de anotação aberta
  e com a opção ligada (Estilo > Movimento).
*/
function autoFocusSelectedNode() {
  if (!zoomOnSelectEnabled) return;

  if (
    document.body.classList.contains(
      "notes-closed"
    )
  ) {
    return;
  }

  focusSelectedNode();
}

/* ============================================================
   PREFERÊNCIAS DE ZOOM (sensibilidade e zoom ao selecionar)
   Valem pro app todo, não por mapa — ficam no navegador.
   ============================================================ */

function initZoomPreferences() {
  const slider =
    document.getElementById(
      "zoomSensSlider"
    );

  const valueLabel =
    document.getElementById(
      "zoomSensValue"
    );

  const popover =
    document.getElementById(
      "zoomSensPopover"
    );

  const toggle =
    document.getElementById(
      "zoomOnSelectToggle"
    );

  function applySensitivity(
    percent,
    save
  ) {
    const value = clamp(
      Math.round(percent),
      1,
      20
    );

    ZOOM_STEP = value / 100;

    slider.value = value;
    valueLabel.textContent =
      `${value}%`;

    if (save) {
      localStorage.setItem(
        ZOOM_SENSITIVITY_KEY,
        String(value)
      );
    }
  }

  const savedSensitivity =
    parseInt(
      localStorage.getItem(
        ZOOM_SENSITIVITY_KEY
      ),
      10
    );

  applySensitivity(
    Number.isNaN(savedSensitivity)
      ? 5
      : savedSensitivity,
    false
  );

  slider.addEventListener(
    "input",
    () =>
      applySensitivity(
        Number(slider.value),
        true
      )
  );

  /* Botão ao lado do zoom abre/fecha a barrinha. */
  document
    .getElementById("zoomSensBtn")
    .addEventListener("click", () => {
      popover.hidden = !popover.hidden;
    });

  document.addEventListener(
    "pointerdown",
    event => {
      if (
        !popover.hidden &&
        !event.target.closest(
          "#zoomControls"
        )
      ) {
        popover.hidden = true;
      }
    }
  );

  zoomOnSelectEnabled =
    localStorage.getItem(
      ZOOM_ON_SELECT_KEY
    ) !== "0";

  toggle.checked =
    zoomOnSelectEnabled;

  toggle.addEventListener(
    "change",
    () => {
      zoomOnSelectEnabled =
        toggle.checked;

      localStorage.setItem(
        ZOOM_ON_SELECT_KEY,
        zoomOnSelectEnabled ? "1" : "0"
      );
    }
  );
}
