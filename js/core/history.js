/* ============================================================
   HISTÓRICO / DESFAZER
   Guarda uma "foto" dos blocos e conexões do mapa atual antes
   de cada ação que muda algo (criar, excluir, renomear,
   arrastar, aplicar layout). Ctrl+Z volta pra foto anterior.
   ============================================================ */

const HISTORY_LIMIT = 40;

const historyStacks = new Map();

function pushHistory() {
  const map = currentMap();

  if (!map) return;

  if (!historyStacks.has(map.id)) {
    historyStacks.set(map.id, []);
  }

  const stack = historyStacks.get(map.id);

  stack.push(
    JSON.stringify({
      nodes: map.nodes,
      connections: map.connections
    })
  );

  if (stack.length > HISTORY_LIMIT) {
    stack.shift();
  }
}

function undo() {
  const map = currentMap();

  if (!map) return;

  const stack = historyStacks.get(map.id);

  if (!stack || stack.length === 0) {
    return;
  }

  const snapshot =
    JSON.parse(stack.pop());

  map.nodes = snapshot.nodes;
  map.connections = snapshot.connections;

  AppState.selectedId = null;

  touchMapEdited();
  render();
  saveData();
}
