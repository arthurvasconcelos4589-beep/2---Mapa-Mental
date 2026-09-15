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
  orderValue
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

    circle.setAttribute("r", "9");

    const text =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );

    text.setAttribute(
      "text-anchor",
      "middle"
    );

    text.setAttribute("dy", "3.5");

    const title =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "title"
      );

    title.textContent =
      "Clique para mudar a ordem";

    group.appendChild(circle);
    group.appendChild(text);
    group.appendChild(title);

    group.addEventListener(
      "click",
      event => {
        event.stopPropagation();
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

  group.dataset.nodeId = nodeId;

  group.setAttribute(
    "transform",
    `translate(${x}, ${y})`
  );

  group.querySelector(
    "text"
  ).textContent = orderValue;
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

  /*
    Espaço proposital entre a linha e cada bloco.
  */
  const start = edgePoint(
    from,
    to,
    14
  );

  const end = edgePoint(
    to,
    from,
    14
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
  const map = currentMap();

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
      childNode?.order ?? 0
    );
  } else {
    removeOrderLabel(key);
  }
}
