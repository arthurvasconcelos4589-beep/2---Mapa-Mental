/* ============================================================
   HISTÓRICO / DESFAZER / REFAZER
   Guarda uma "foto" dos blocos e conexões do mapa atual antes
   de cada ação que muda algo (criar, excluir, renomear,
   arrastar, escrever numa anotação, aplicar layout...).
   Ctrl+Z volta pra foto anterior; Ctrl+Y (ou Ctrl+Shift+Z)
   refaz o que foi desfeito.
   ============================================================ */

const HISTORY_LIMIT = 40;

const historyStacks = new Map();
const redoStacks = new Map();

function snapshotMap(map) {
  return JSON.stringify({
    nodes: map.nodes,
    connections: map.connections
  });
}

function pushHistory() {
  const map = currentMap();

  if (!map) return;

  if (!historyStacks.has(map.id)) {
    historyStacks.set(map.id, []);
  }

  const stack = historyStacks.get(map.id);

  const snapshot = snapshotMap(map);

  /* Uma ação nova invalida o que dava pra "refazer". */
  redoStacks.delete(map.id);

  /* Nada mudou desde o último passo: não repete. */
  if (stack[stack.length - 1] === snapshot) {
    return;
  }

  stack.push(snapshot);

  if (stack.length > HISTORY_LIMIT) {
    stack.shift();
  }
}

function restoreSnapshot(map, snapshot) {
  const data = JSON.parse(snapshot);

  map.nodes = data.nodes;
  map.connections = data.connections;

  AppState.selectedId = null;

  /* Filhos que ainda estavam deslizando atrás de um bloco. */
  followerList = null;

  touchMapEdited();
  render();
  saveData();
}

function undo() {
  const map = currentMap();

  if (!map) return;

  const stack = historyStacks.get(map.id);

  if (!stack || stack.length === 0) {
    return;
  }

  const current = snapshotMap(map);

  /* Pula passos iguais ao estado atual (não mudariam nada). */
  let snapshot = null;

  while (stack.length > 0) {
    const candidate = stack.pop();

    if (candidate !== current) {
      snapshot = candidate;
      break;
    }
  }

  if (!snapshot) return;

  if (!redoStacks.has(map.id)) {
    redoStacks.set(map.id, []);
  }

  redoStacks.get(map.id).push(current);

  restoreSnapshot(map, snapshot);
}

function redo() {
  const map = currentMap();

  if (!map) return;

  const stack = redoStacks.get(map.id);

  if (!stack || stack.length === 0) {
    return;
  }

  const snapshot = stack.pop();

  /* Volta o estado atual pro "desfazer", sem apagar o resto do "refazer". */
  if (!historyStacks.has(map.id)) {
    historyStacks.set(map.id, []);
  }

  historyStacks.get(map.id).push(
    snapshotMap(map)
  );

  restoreSnapshot(map, snapshot);
}
