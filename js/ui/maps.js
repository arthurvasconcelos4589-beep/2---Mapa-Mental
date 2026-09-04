/* ============================================================
   MAPAS MENTAIS
   ============================================================ */

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

  const filtered =
    AppState.maps.filter(map =>
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

    const dot =
      document.createElement("span");

    dot.className = "map-item-dot";
    dot.style.background =
      map.color || "#4f8ff7";

    const nameBtn =
      document.createElement("button");

    nameBtn.className = "map-item-name";

    const count = map.nodes.length;

    nameBtn.innerHTML = `
      <span class="map-item-name-text">${escapeHtml(map.name)}</span>
      <span class="map-item-name-meta">${count} nó${count === 1 ? "" : "s"} · ${timeAgo(map.lastEditedAt)}</span>
    `;

    nameBtn.addEventListener(
      "click",
      () => switchMap(map.id)
    );

    const deleteBtn =
      document.createElement("button");

    deleteBtn.className =
      "map-item-delete";
    deleteBtn.textContent = "×";
    deleteBtn.title = "Excluir mapa";

    deleteBtn.addEventListener(
      "click",
      event => {
        event.stopPropagation();
        deleteMap(map.id);
      }
    );

    row.appendChild(dot);
    row.appendChild(nameBtn);
    row.appendChild(deleteBtn);

    list.appendChild(row);
  });

  const map = currentMap();

  document.getElementById(
    "currentMapTitle"
  ).textContent =
    map?.name || "Nenhum mapa";

  const badgeDot =
    document.getElementById(
      "currentMapBadgeDot"
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
    badgeDot.style.background =
      map.color || "#4f8ff7";
    badgeName.textContent = map.name;
    badgeCount.textContent =
      `${map.nodes.length} nó${map.nodes.length === 1 ? "" : "s"}`;
  } else {
    badgeDot.style.background =
      "var(--muted)";
    badgeName.textContent =
      "Nenhum mapa";
    badgeCount.textContent = "";
  }
}

function escapeHtml(text) {
  const div =
    document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
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

  if (parent) {
    const siblings =
      childrenOf(parent.id);

    const index =
      siblings.length;

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

    phase:
      Math.random() *
      Math.PI *
      2,

    speed:
      .45 +
      Math.random() * .18,

    /*
      NOVO:
      filhos começam fechados.
    */
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
