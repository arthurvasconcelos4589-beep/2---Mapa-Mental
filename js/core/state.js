/* ============================================================
   ESTADO
   ============================================================ */

const AppState = {
  maps: [],
  currentMapId: null,

  selectedId: null,
  drag: null,
  boardPan: null,

  /*
    Zoom, layout, tipografia e cor pertencem ao mapa.
    Assim cada mapa pode lembrar seu próprio enquadramento
    e estilo.
  */

  mapColorIndex: 0,

  createEmptyMap(name = "Novo mapa") {
    const id = `map-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const palette = [
      "#4f8ff7",
      "#39c97a",
      "#a374f0",
      "#f2a93b",
      "#f2545b",
      "#33c2c2"
    ];

    const color =
      palette[
        this.mapColorIndex % palette.length
      ];

    this.mapColorIndex++;

    return {
      id,
      name,
      color,

      zoom: 1,
      panX: 0,
      panY: 0,

      /*
        Configurações visuais do mapa.
      */
      layout: "radial",
      fontSize: 14,
      lineThickness: 1.4,
      nodeSpacing: 60,
      nodeWidth: 190,
      nodeRadius: 0,
      dimmedOpacity: 90,
      showCorners: true,

      createdAt: Date.now(),
      lastEditedAt: Date.now(),

      /*
        Um mapa mental começa com UM único bloco.
        Nenhum filho é criado automaticamente.
      */
      root: null,

      nodes: [],
      connections: []
    };
  }
};

function currentMap() {
  return AppState.maps.find(
    map => map.id === AppState.currentMapId
  );
}

function getNode(id) {
  const map = currentMap();

  if (!map) return null;

  return map.nodes.find(node => node.id === id);
}

function childrenOf(id) {
  const map = currentMap();

  if (!map) return [];

  return map.nodes.filter(
    node => node.parentId === id
  );
}

function getDescendants(id) {
  const result = new Set();

  let changed = true;

  while (changed) {
    changed = false;

    const map = currentMap();

    if (!map) break;

    map.nodes.forEach(node => {
      if (
        node.parentId &&
        (node.parentId === id ||
         result.has(node.parentId)) &&
        !result.has(node.id)
      ) {
        result.add(node.id);
        changed = true;
      }
    });
  }

  return result;
}

/*
  Um filho aparece se seu pai estiver com "filhos abertos".
  Cada nó possui seu próprio childrenOpen.

  Isso resolve o problema anterior em que clicar no filho fazia
  seus próprios filhos desaparecerem.
*/
function isVisible(node) {
  if (!node) return false;

  if (!node.parentId) {
    return true;
  }

  const parent = getNode(node.parentId);

  if (!parent) {
    return false;
  }

  return (
    parent.childrenOpen === true &&
    isVisible(parent)
  );
}

function visibleNodes() {
  const map = currentMap();

  if (!map) return [];

  return map.nodes.filter(isVisible);
}

/*
  Marca o mapa atual como editado agora.
  Usado pela lista de mapas para mostrar "há 2h", "ontem" etc.
  Chamado só em edições de verdade (criar/excluir/renomear/
  mover/notar), não em zoom ou seleção.
*/
function touchMapEdited() {
  const map = currentMap();

  if (map) {
    map.lastEditedAt = Date.now();
  }
}
