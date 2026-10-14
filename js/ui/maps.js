/* ============================================================
   MAPAS MENTAIS
   ============================================================ */

const MAP_COLOR_PALETTE = [
  "#4f8ff7", "#39c97a", "#a374f0", "#f2a93b",
  "#f2545b", "#33c2c2", "#e05fa0", "#8d99ae"
];

/*
  Tempo relativo pro selo "há 2h" / "ontem" / "3 dias" na
  lista de mapas.
*/
function timeAgo(timestamp) {
  if (!timestamp) return "";

  const diff = Date.now() - timestamp;

  const minute = 60000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diff < minute) return "agora";
  if (diff < hour) {
    return `há ${Math.max(1, Math.floor(diff / minute))}min`;
  }
  if (diff < day) {
    return `há ${Math.floor(diff / hour)}h`;
  }
  if (diff < 2 * day) return "ontem";
  if (diff < week) {
    return `${Math.floor(diff / day)} dias`;
  }

  return `${Math.floor(diff / week)} sem`;
}

function escapeHtml(text) {
  const div =
    document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}

/* ---------- Lista de mapas (dentro do dropdown) ---------- */

function renderMapsList() {
  const list =
    document.getElementById("mapsList");

  const searchInput =
    document.getElementById(
      "mapSearchInput"
    );

  const query =
    (searchInput?.value || "")
      .trim()
      .toLowerCase();

  const sorted = getSortedMaps();

  const filtered = sorted.filter(map =>
    map.name
      .toLowerCase()
      .includes(query)
  );

  list.innerHTML = "";

  if (filtered.length === 0) {
    const empty =
      document.createElement("div");

    empty.className = "panel-empty";

    empty.textContent =
      AppState.maps.length === 0
        ? "Nenhum mapa ainda."
        : "Nenhum mapa encontrado.";

    list.appendChild(empty);
  }

  filtered.forEach(map => {
    const row =
      document.createElement("div");

    row.className = "map-item";

    if (
      map.id === AppState.currentMapId
    ) {
      row.classList.add("active");
    }

    if (map.id === mapSelectedInModalId) {
      row.classList.add("selected");
    }

    let thumb;

    if (map.image) {
      thumb =
        document.createElement("img");

      thumb.className = "map-item-image";
      thumb.src = map.image;
      thumb.alt = "";
    } else {
      thumb =
        document.createElement("span");

      thumb.className = "map-item-dot";
      thumb.style.background =
        map.color || "#4f8ff7";
    }

    const nameBtn =
      document.createElement("button");

    nameBtn.className = "map-item-name";

    const count = map.nodes.length;

    nameBtn.innerHTML = `
      <span class="map-item-name-text">${escapeHtml(map.name)}</span>
      <span class="map-item-name-meta">${count} nó${count === 1 ? "" : "s"} · ${timeAgo(map.lastEditedAt)}</span>
    `;

    /*
      Clicar numa linha só SELECIONA o mapa (mostra a edição
      dele no painel ao lado). Trocar de verdade é no botão
      "Ir para este mapa".
    */
    row.addEventListener(
      "click",
      () => {
        mapSelectedInModalId = map.id;
        renderMapsList();
      }
    );

    row.appendChild(thumb);
    row.appendChild(nameBtn);

    list.appendChild(row);
  });

  updateCurrentMapBadge();
  renderMapEditPanel();
}

function updateCurrentMapBadge() {
  const map = currentMap();

  document.getElementById(
    "currentMapTitle"
  ).textContent =
    map?.name || "Nenhum mapa";

  const badgeDot =
    document.getElementById(
      "currentMapBadgeDot"
    );

  const badgeImage =
    document.getElementById(
      "currentMapBadgeImage"
    );

  const badgeName =
    document.getElementById(
      "currentMapBadgeName"
    );

  const badgeCount =
    document.getElementById(
      "currentMapBadgeCount"
    );

  if (map) {
    if (map.image) {
      badgeImage.src = map.image;
      badgeImage.hidden = false;
      badgeDot.hidden = true;
    } else {
      badgeDot.style.background =
        map.color || "#4f8ff7";
      badgeDot.hidden = false;
      badgeImage.hidden = true;
    }

    badgeName.textContent = map.name;
    badgeCount.textContent =
      `${map.nodes.length} nó${map.nodes.length === 1 ? "" : "s"}`;
  } else {
    badgeDot.style.background =
      "var(--muted)";
    badgeDot.hidden = false;
    badgeImage.hidden = true;
    badgeName.textContent =
      "Nenhum mapa";
    badgeCount.textContent = "";
  }
}

/* ---------- Janela de mapas (modal no meio da tela) ---------- */

/*
  Mapa selecionado na lista da janela. Começa no mapa atual
  e é o alvo dos botões "Ir para este mapa" e "Excluir mapa"
  e do painel de edição (cor / imagem / ordem).
*/
let mapSelectedInModalId = null;

function isMapsModalOpen() {
  const modal =
    document.getElementById(
      "mapsModal"
    );

  return !!modal && !modal.hidden;
}

function openMapsModal() {
  mapSelectedInModalId =
    AppState.currentMapId;

  document.getElementById(
    "mapSearchInput"
  ).value = "";

  document.getElementById(
    "mapsModal"
  ).hidden = false;

  renderMapsList();
}

function closeMapsModal() {
  mapSelectedInModalId = null;

  document.getElementById(
    "mapsModal"
  ).hidden = true;
}

/*
  Roda uma ação (criar/importar mapa). Se ela trocou o mapa
  atual, a janela fecha — igual a trocar de mapa pela lista.
*/
async function runAndCloseModalIfMapChanged(
  action
) {
  const before =
    AppState.currentMapId;

  await action();

  if (
    AppState.currentMapId !== before
  ) {
    closeMapsModal();
  }
}

/* ---------- Painel de edição do mapa selecionado ---------- */

function renderMapEditPanel() {
  const map = AppState.maps.find(
    item => item.id === mapSelectedInModalId
  );

  const hasMap = !!map;

  document.getElementById(
    "mapEditBody"
  ).hidden = !hasMap;

  document.getElementById(
    "mapEditEmpty"
  ).hidden = hasMap;

  document.getElementById(
    "mapDeleteBtn"
  ).disabled = !hasMap;

  document.getElementById(
    "mapGoBtn"
  ).disabled =
    !hasMap ||
    map.id === AppState.currentMapId;

  if (!hasMap) return;

  const dot =
    document.getElementById(
      "mapEditDot"
    );

  const image =
    document.getElementById(
      "mapEditImage"
    );

  if (map.image) {
    image.src = map.image;
    image.hidden = false;
    dot.hidden = true;
  } else {
    dot.style.background =
      map.color || "#4f8ff7";
    dot.hidden = false;
    image.hidden = true;
  }

  const swatches =
    document.getElementById(
      "mapEditColorSwatches"
    );

  swatches.innerHTML = "";

  MAP_COLOR_PALETTE.forEach(color => {
    const btn =
      document.createElement("button");

    btn.type = "button";
    btn.className =
      "map-edit-color-option";
    btn.style.background = color;

    if (
      !map.image &&
      (map.color || "").toLowerCase() ===
        color.toLowerCase()
    ) {
      btn.classList.add("active");
    }

    btn.addEventListener(
      "click",
      () => {
        map.color = color;
        map.image = null;
        touchMapEdited();
        renderMapsList();
        saveData();
      }
    );

    swatches.appendChild(btn);
  });
}

function pickImageFile() {
  return new Promise(resolve => {
    const input =
      document.createElement("input");

    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";

    input.addEventListener(
      "change",
      () => {
        const file = input.files[0];

        input.remove();

        resolve(file || null);
      }
    );

    document.body.appendChild(input);
    input.click();
  });
}

/*
  Redimensiona a imagem pra um ícone pequeno (evita encher
  o localStorage com fotos gigantes) e devolve um data URL.
*/
function resizeImageToDataUrl(
  file,
  maxSize = 96
) {
  return new Promise(
    (resolve, reject) => {
      const reader = new FileReader();

      reader.onerror = () =>
        reject(reader.error);

      reader.onload = () => {
        const img = new Image();

        img.onerror = () =>
          reject(
            new Error(
              "Não foi possível ler a imagem."
            )
          );

        img.onload = () => {
          const scale = Math.min(
            1,
            maxSize /
              Math.max(
                img.width,
                img.height
              )
          );

          const width =
            Math.round(
              img.width * scale
            );

          const height =
            Math.round(
              img.height * scale
            );

          const canvas =
            document.createElement(
              "canvas"
            );

          canvas.width = width;
          canvas.height = height;

          const ctx =
            canvas.getContext("2d");

          ctx.drawImage(
            img,
            0,
            0,
            width,
            height
          );

          resolve(
            canvas.toDataURL(
              "image/png"
            )
          );
        };

        img.src = reader.result;
      };

      reader.readAsDataURL(file);
    }
  );
}

async function uploadMapImage() {
  const map = AppState.maps.find(
    item => item.id === mapSelectedInModalId
  );

  if (!map) return;

  const file = await pickImageFile();

  if (!file) return;

  try {
    const dataUrl =
      await resizeImageToDataUrl(file);

    map.image = dataUrl;

    touchMapEdited();
    renderMapsList();
    saveData();
  } catch (error) {
    console.error(
      "Falha ao processar imagem:",
      error
    );

    await showAlert(
      "Não foi possível usar essa imagem."
    );
  }
}

function removeMapImage() {
  const map = AppState.maps.find(
    item => item.id === mapSelectedInModalId
  );

  if (!map) return;

  map.image = null;

  touchMapEdited();
  renderMapsList();
  saveData();
}

function moveMapInOrder(direction) {
  const sorted = getSortedMaps();

  const index = sorted.findIndex(
    item => item.id === mapSelectedInModalId
  );

  const swapWith =
    index + direction;

  if (
    index === -1 ||
    swapWith < 0 ||
    swapWith >= sorted.length
  ) {
    return;
  }

  const a = sorted[index];
  const b = sorted[swapWith];

  const aIndex = a.sortIndex ?? 0;
  const bIndex = b.sortIndex ?? 0;

  a.sortIndex = bIndex;
  b.sortIndex = aIndex;

  saveData(false);
  renderMapsList();
}

function bindMapControls() {
  document
    .getElementById("currentMapBadge")
    .addEventListener(
      "click",
      openMapsModal
    );

  document
    .getElementById("mapEditUploadBtn")
    .addEventListener(
      "click",
      uploadMapImage
    );

  document
    .getElementById(
      "mapEditRemoveImageBtn"
    )
    .addEventListener(
      "click",
      removeMapImage
    );

  document
    .getElementById("mapEditMoveUpBtn")
    .addEventListener("click", () =>
      moveMapInOrder(-1)
    );

  document
    .getElementById(
      "mapEditMoveDownBtn"
    )
    .addEventListener("click", () =>
      moveMapInOrder(1)
    );

  document
    .getElementById("mapGoBtn")
    .addEventListener("click", () =>
      switchMap(mapSelectedInModalId)
    );

  document
    .getElementById("mapDeleteBtn")
    .addEventListener("click", () =>
      deleteMap(mapSelectedInModalId)
    );

  document
    .getElementById("mapsModalCloseBtn")
    .addEventListener(
      "click",
      closeMapsModal
    );

  /*
    Clicar no fundo escuro fecha a janela. Esc também — mas
    só se não houver uma confirmação aberta por cima dela
    (aí o Esc fecha só a confirmação).
  */
  const modal =
    document.getElementById(
      "mapsModal"
    );

  modal.addEventListener(
    "click",
    event => {
      if (event.target === modal) {
        closeMapsModal();
      }
    }
  );

  document.addEventListener(
    "keydown",
    event => {
      const dialog =
        document.getElementById(
          "dialogOverlay"
        );

      if (
        event.key === "Escape" &&
        isMapsModalOpen() &&
        (!dialog || dialog.hidden)
      ) {
        closeMapsModal();
      }
    }
  );
}

async function createMap() {
  const name = await showPrompt(
    "Nome do novo mapa:"
  );

  if (name === null) {
    return;
  }

  const map =
    AppState.createEmptyMap(
      name.trim() || "Novo mapa"
    );

  /*
    Criar o mapa cria também seu ÚNICO
    bloco principal.
  */
  const root = createNodeData(
    null,
    "NOVO MAPA",
    true
  );

  map.root = root.id;
  map.nodes.push(root);

  AppState.maps.push(map);
  AppState.currentMapId = map.id;

  resetSelection();
  renderAll();
  saveData();
}

function switchMap(mapId) {
  closeMapsModal();

  if (
    mapId === AppState.currentMapId
  ) {
    return;
  }

  AppState.currentMapId = mapId;

  resetSelection();
  renderAll();
  saveData(false);
}

async function renameCurrentMap() {
  const map = currentMap();

  if (!map) return;

  const name = await showPrompt(
    "Nome do mapa:",
    map.name
  );

  if (name === null) return;

  map.name =
    name.trim() || "Sem nome";

  touchMapEdited();
  renderMapsList();
  saveData();
}

async function deleteMap(mapId) {
  const map =
    AppState.maps.find(
      item => item.id === mapId
    );

  if (!map) return;

  const confirmed =
    await showConfirm(
      `Excluir o mapa "${map.name}"?`
    );

  if (!confirmed) {
    return;
  }

  AppState.maps =
    AppState.maps.filter(
      item => item.id !== mapId
    );

  if (
    AppState.currentMapId === mapId
  ) {
    AppState.currentMapId =
      AppState.maps[0]?.id || null;

    resetSelection();
  }

  mapSelectedInModalId =
    AppState.currentMapId;

  renderAll();
  saveData();
}

function resetSelection() {
  AppState.selectedId = null;
}

function createNodeData(
  parentId,
  title,
  large = false
) {
  const parent = parentId
    ? getNode(parentId)
    : null;

  let x = .5;
  let y = .5;
  let order = 0;

  if (parent) {
    const siblings =
      childrenOf(parent.id);

    const index =
      siblings.length;

    order = index;

    /*
      Posição inicial em torno do pai.
      O layout é apenas inicial: o usuário
      pode arrastar depois.
    */
    const angle =
      index * 1.15 - 1.15;

    const radius = .27;

    x = clamp(
      parent.x +
        Math.cos(angle) * radius,
      .08,
      .92
    );

    y = clamp(
      parent.y +
        Math.sin(angle) * radius,
      .10,
      .90
    );
  }

  return {
    id:
      `node-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`,

    parentId,

    x,
    y,

    title,
    note: "",

    large,

    /*
      Número de ordem entre os irmãos — aparece na linha
      de conexão quando ativado, e os layouts (Radial,
      Árvore H/V) organizam os blocos seguindo essa ordem.
    */
    order,

    phase:
      Math.random() *
      Math.PI *
      2,

    speed:
      .45 +
      Math.random() * .18,

    childrenOpen: false
  };
}

function createRootIfMissing() {
  const map = currentMap();

  if (!map || map.root) {
    return;
  }

  const root =
    createNodeData(
      null,
      "NOVO MAPA",
      true
    );

  map.root = root.id;
  map.nodes.push(root);
}
