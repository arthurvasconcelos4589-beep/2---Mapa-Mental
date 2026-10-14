/* ============================================================
   CONEXÕES
   ============================================================ */

/*
  Cache "fromId>toId" -> elemento <line>. Em vez de apagar e
  recriar todas as linhas a cada frame de animação (60x por
  segundo), reaproveita as que já existem e só atualiza as
  coordenadas — bem mais leve.
*/
let connectionLineCache = new Map();

/*
  Mesma ideia, só que pros números de ordem (círculo +
  texto) que aparecem no meio das linhas quando ativado.
*/
let orderLabelCache = new Map();

function clearAllConnectionLines() {
  connectionLineCache.forEach(
    line => line.remove()
  );

  connectionLineCache.clear();

  orderLabelCache.forEach(
    group => group.remove()
  );

  orderLabelCache.clear();
}

function removeOrderLabel(key) {
  const group =
    orderLabelCache.get(key);

  if (group) {
    group.remove();
    orderLabelCache.delete(key);
  }
}

function updateOrderLabel(
  key,
  nodeId,
  x,
  y,
  orderValue,
  options
) {
  let group =
    orderLabelCache.get(key);

  if (!group) {
    group =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );

    group.classList.add(
      "connection-order"
    );

    const circle =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );

    const text =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );

    text.setAttribute(
      "text-anchor",
      "middle"
    );

    const title =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "title"
      );

    group.appendChild(circle);
    group.appendChild(text);
    group.appendChild(title);

    group.addEventListener(
      "click",
      event => {
        event.stopPropagation();

        if (
          group.dataset.editable ===
          "0"
        ) {
          return;
        }

        editNodeOrder(
          group.dataset.nodeId
        );
      }
    );

    document
      .getElementById("connections")
      .appendChild(group);

    orderLabelCache.set(
      key,
      group
    );
  }

  const radius = (options.size || 18) / 2;

  group.dataset.nodeId = nodeId;
  group.dataset.editable =
    options.editable ? "1" : "0";

  group.classList.toggle(
    "no-border",
    !options.border
  );

  group.classList.toggle(
    "locked",
    !options.editable
  );

  group.setAttribute(
    "transform",
    `translate(${x}, ${y})`
  );

  group
    .querySelector("circle")
    .setAttribute("r", radius);

  const text =
    group.querySelector("text");

  text.setAttribute(
    "dy",
    radius * .38
  );

  text.setAttribute(
    "font-size",
    radius * 1.1
  );

  text.textContent = orderValue;

  group.querySelector(
    "title"
  ).textContent = options.editable
    ? "Clique para mudar a ordem"
    : "Renumeração desativada nas configurações";
}

/*
  Clicar no número de ordem deixa trocar pra qualquer
  valor — útil pra reordenar uma sequência de ensino.
*/
async function editNodeOrder(
  nodeId
) {
  const node = getNode(nodeId);

  if (!node) return;

  const value = await showPrompt(
    "Número de ordem:",
    String(node.order ?? 0)
  );

  if (value === null) return;

  const parsed = parseInt(
    value,
    10
  );

  if (Number.isNaN(parsed)) return;

  pushHistory();

  node.order = parsed;

  touchMapEdited();
  render();
  saveData();
}

function drawConnections() {
  const map = currentMap();

  if (!map) {
    clearAllConnectionLines();
    return;
  }

  const ids = new Set(
    visibleNodes().map(node => node.id)
  );

  const activeKeys = new Set();

  /*
    Relações hierárquicas pai -> filho.
  */
  map.nodes.forEach(child => {
    if (!child.parentId) return;

    if (
      ids.has(child.id) &&
      ids.has(child.parentId)
    ) {
      const key =
        `${child.parentId}>${child.id}`;

      activeKeys.add(key);

      drawLine(
        key,
        child.parentId,
        child.id,
        false
      );
    }
  });

  /*
    Relações extras.
  */
  map.connections.forEach(
    ([fromId, toId]) => {
      if (
        ids.has(fromId) &&
        ids.has(toId)
      ) {
        const key =
          `${fromId}>${toId}:extra`;

        activeKeys.add(key);

        drawLine(
          key,
          fromId,
          toId,
          true
        );
      }
    }
  );

  /*
    Remove só as linhas (e números) que não se aplicam mais
    (bloco escondido/apagado ou conexão removida).
  */
  connectionLineCache.forEach(
    (line, key) => {
      if (!activeKeys.has(key)) {
        line.remove();
        connectionLineCache.delete(key);
        removeOrderLabel(key);
      }
    }
  );
}

function drawLine(
  key,
  fromId,
  toId,
  extra
) {
  const fromElement =
    nodeElementCache.get(fromId);

  const toElement =
    nodeElementCache.get(toId);

  if (!fromElement || !toElement) {
    const stale =
      connectionLineCache.get(key);

    if (stale) {
      stale.remove();
      connectionLineCache.delete(key);
    }

    removeOrderLabel(key);

    return;
  }

  const from = centerOf(fromElement);
  const to = centerOf(toElement);

  const map = currentMap();

  /*
    Espaço proposital entre a linha e cada bloco —
    configurável em Estilização > Espaçamento.
  */
  const gap = map?.lineGap ?? 14;

  const start = edgePoint(
    from,
    to,
    gap
  );

  const end = edgePoint(
    to,
    from,
    gap
  );

  let line =
    connectionLineCache.get(key);

  if (!line) {
    line =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );

    line.classList.add("connection");

    if (extra) {
      line.classList.add("extra");
    }

    document
      .getElementById("connections")
      .appendChild(line);

    connectionLineCache.set(
      key,
      line
    );
  }

  line.setAttribute("x1", start.x);
  line.setAttribute("y1", start.y);
  line.setAttribute("x2", end.x);
  line.setAttribute("y2", end.y);

  /*
    Número de ordem: só nas linhas hierárquicas (não nas
    extras), e só quando ativado nas configurações.
  */
  const showOrder =
    map &&
    map.showOrderNumbers &&
    !extra;

  if (showOrder) {
    const midX =
      (start.x + end.x) / 2;

    const midY =
      (start.y + end.y) / 2;

    const childNode = getNode(toId);

    updateOrderLabel(
      key,
      toId,
      midX,
      midY,
      childNode?.order ?? 0,
      {
        border:
          map.orderNumberBorder !==
          false,
        editable:
          map.orderNumberEditable !==
          false,
        /*
          Proporcional ao zoom: o número encolhe e cresce
          junto com os blocos, em vez de ficar do mesmo
          tamanho na tela.
        */
        size:
          (map.orderNumberSize || 18) *
          (map.zoom || 1)
      }
    );
  } else {
    removeOrderLabel(key);
  }
}
