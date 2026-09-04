/* ============================================================
   ZOOM
   ============================================================ */

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 7.5;
const ZOOM_STEP = 0.05;

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
    Math.round(value * 20) / 20,
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
