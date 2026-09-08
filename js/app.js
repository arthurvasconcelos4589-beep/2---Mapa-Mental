/* ============================================================
   APP / INICIALIZAÇÃO
   ============================================================ */

function resizeBoard() {
  /*
    O board em si não muda de tamanho (fica sempre em
    tela cheia — é assim que o mapa fica parado quando
    as barras abrem/fecham). Só redesenhamos o conteúdo.
  */
  render();
}

/*
  As barras laterais flutuam por cima do board sem
  redimensioná-lo. Só os elementos de interface (cabeçalho,
  ferramentas, zoom) precisam saber se alguma barra está
  fechada, pra não ficarem escondidos atrás dela.
*/
function updateSidebarWidthVars() {
  const mapsClosed =
    document
      .getElementById("mapsPanel")
      .classList.contains("closed");

  const notesClosed =
    document.body.classList.contains(
      "notes-closed"
    );

  document.documentElement.style
    .setProperty(
      "--sidebar-left-active",
      mapsClosed
        ? "0px"
        : "var(--sidebar-left)"
    );

  document.documentElement.style
    .setProperty(
      "--sidebar-right-active",
      notesClosed
        ? "0px"
        : "var(--sidebar-right)"
    );
}

function refreshActivePanelTab() {
  const activeBtn =
    document.querySelector(
      ".panel-tab.active"
    );

  if (!activeBtn) return;

  switchPanelTab(activeBtn.dataset.tab);
}

function renderAll() {
  renderMapsList();
  updateZoomUI();
  applyNodeStyleVars();
  render();
  refreshActivePanelTab();
}

/* ---------- Mapas ---------- */

document
  .getElementById("newMapBtn")
  .addEventListener(
    "click",
    createMap
  );

document
  .getElementById("exportMapBtn")
  .addEventListener(
    "click",
    exportCurrentMap
  );

document
  .getElementById("importMapBtn")
  .addEventListener(
    "click",
    importMap
  );

document
  .getElementById("mapSearchInput")
  .addEventListener(
    "input",
    renderMapsList
  );

document
  .getElementById("toggleMapsBtn")
  .addEventListener(
    "click",
    () => {
      document
        .getElementById("mapsPanel")
        .classList.toggle("closed");

      updateSidebarWidthVars();
      resizeBoard();
    }
  );

/*
  Duplo clique no nome do mapa permite renomeá-lo.
*/
document
  .getElementById("currentMapTitle")
  .addEventListener(
    "dblclick",
    renameCurrentMap
  );

/* ---------- Sidebar direita ---------- */

document
  .getElementById("toggleNotesBtn")
  .addEventListener(
    "click",
    toggleNotesPanel
  );

document
  .getElementById(
    "openNotesFloatingBtn"
  )
  .addEventListener(
    "click",
    openNotesPanel
  );

document
  .getElementById("notesTitle")
  .addEventListener(
    "click",
    renameSelectedNode
  );

document
  .getElementById("note")
  .addEventListener(
    "input",
    () => {
      if (!AppState.selectedId) {
        return;
      }

      const node =
        getNode(
          AppState.selectedId
        );

      if (!node) return;

      node.note =
        document.getElementById(
          "note"
        ).innerHTML;

      /*
        Salvamento automático.
      */
      touchMapEdited();
      saveData(false);
    }
  );

/* ---------- Zoom ---------- */

document
  .getElementById("zoomInBtn")
  .addEventListener(
    "click",
    () => {
      setZoomTransitionInstant(false);
      changeZoom(ZOOM_STEP);
    }
  );

document
  .getElementById("zoomOutBtn")
  .addEventListener(
    "click",
    () => {
      setZoomTransitionInstant(false);
      changeZoom(-ZOOM_STEP);
    }
  );

document
  .getElementById("resetZoomBtn")
  .addEventListener(
    "click",
    () => {
      setZoomTransitionInstant(false);
      resetZoom();
    }
);

/* ---------- Mapa ---------- */

document
  .getElementById("board")
  .addEventListener(
    "pointermove",
    event => {
      handlePointerMove(event);
      handleBoardPan(event);
    }
  );

document
  .getElementById("board")
  .addEventListener(
    "pointerup",
    event => {
      handlePointerUp();
      endBoardPan(event);
    }
  );

document
  .getElementById("board")
  .addEventListener(
    "pointercancel",
    event => {
      handlePointerUp();
      endBoardPan(event);
    }
  );

/*
  Segurar o mouse numa área vazia do board (sem nenhum
  bloco embaixo) e arrastar move a câmera — como seria
  numa "mesa" de mapa mental de verdade.
*/
document
  .getElementById("board")
  .addEventListener(
    "pointerdown",
    onBoardPointerDown
  );

window.addEventListener(
  "resize",
  resizeBoard
);

/*
  Rolar o mouse/scrollbar sobre a área de blocos
  controla o zoom, e o zoom acontece exatamente a partir
  de onde o cursor está a cada instante — o ponto sob o
  mouse fica fixo na tela, sem "puxar" o mapa junto.
*/
document
  .getElementById("board")
  .addEventListener(
    "wheel",
    event => {
      event.preventDefault();

      const area =
        document
          .getElementById("board")
          .getBoundingClientRect();

      const pivotX =
        event.clientX - area.left;

      const pivotY =
        event.clientY - area.top;

      setZoomTransitionInstant(true);

      const direction =
        event.deltaY > 0 ? -1 : 1;

      changeZoomAt(
        direction * ZOOM_STEP,
        pivotX,
        pivotY
      );
    },
    { passive: false }
  );

/*
  Loop de animação.
*/
function animationLoop() {
  if (!AppState.drag && !AppState.boardPan) {
    updatePositions();
  }

  /*
    As linhas sempre acompanham os blocos, mesmo durante
    o arrasto de um bloco ou o pan da tela — é barato
    (só atualiza coordenadas de linhas já existentes).
  */
  drawConnections();

  requestAnimationFrame(
    animationLoop
  );
}

/* ---------- Inicialização ---------- */

loadTheme();
loadGridPreference();
loadShortcutOverrides();
updateSidebarWidthVars();
bindPanelTabs();
bindNodeStyleSliders();
bindLayoutToggle();
bindShortcutsTab();
bindNoteToolbar();

document.getElementById(
  "panelVersion"
).textContent = APP_VERSION;

loadData();
renderAll();

requestAnimationFrame(
  animationLoop
);
