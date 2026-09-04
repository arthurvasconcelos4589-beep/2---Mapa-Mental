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

function clearAllConnectionLines() {
  connectionLineCache.forEach(
    line => line.remove()
  );

  connectionLineCache.clear();
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
    Remove só as linhas que não se aplicam mais
    (bloco escondido/apagado ou conexão removida).
  */
  connectionLineCache.forEach(
    (line, key) => {
      if (!activeKeys.has(key)) {
        line.remove();
        connectionLineCache.delete(key);
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
}
