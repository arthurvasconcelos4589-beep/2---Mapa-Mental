/* ============================================================
   LAYOUT
   Calcula a posição (x, y — frações do mapa) de cada bloco
   de acordo com o estilo escolhido. O usuário ainda pode
   arrastar livremente depois; isso só define o ponto de
   partida.
   ============================================================ */

const LAYOUTS = [
  {
    key: "radial",
    name: "Radial",
    desc: "Expande a partir do centro"
  },
  {
    key: "tree-h",
    name: "Árvore H",
    desc: "Hierarquia horizontal"
  },
  {
    key: "tree-v",
    name: "Árvore V",
    desc: "Hierarquia vertical"
  },
  {
    key: "organic",
    name: "Orgânico",
    desc: "Posicionamento livre"
  },
  {
    key: "timeline",
    name: "Timeline",
    desc: "Sequência linear"
  }
];

function buildChildrenMap(map) {
  const childrenMap = new Map();

  map.nodes.forEach(node => {
    if (!node.parentId) return;

    if (!childrenMap.has(node.parentId)) {
      childrenMap.set(node.parentId, []);
    }

    childrenMap.get(node.parentId).push(node);
  });

  /*
    Ordena cada grupo de irmãos pelo número de ordem, então
    Radial e Árvore H/V organizam os blocos seguindo essa
    sequência (útil pra ensinar passo a passo, por exemplo).
  */
  childrenMap.forEach(list => {
    list.sort(
      (a, b) =>
        (a.order ?? 0) -
        (b.order ?? 0)
    );
  });

  return childrenMap;
}

function openAllChildren(map, childrenMap) {
  map.nodes.forEach(node => {
    if (
      childrenMap.has(node.id) &&
      childrenMap.get(node.id).length > 0
    ) {
      node.childrenOpen = true;
    }
  });
}

/*
  RADIAL: o bloco principal fica no centro; cada geração
  seguinte forma um anel mais distante, dividindo o ângulo
  do pai entre os próprios filhos.
*/
function layoutRadial(root, childrenMap, spacing) {
  const ringGap = .17 * spacing;

  function place(node, depth, angleStart, angleEnd) {
    if (depth === 0) {
      node.x = .5;
      node.y = .5;
    } else {
      const angle = (angleStart + angleEnd) / 2;
      const radius = depth * ringGap;

      node.x = .5 + Math.cos(angle) * radius;
      node.y = .5 + Math.sin(angle) * radius;
    }

    const kids = childrenMap.get(node.id) || [];

    if (!kids.length) return;

    const step = (angleEnd - angleStart) / kids.length;

    kids.forEach((kid, i) => {
      place(
        kid,
        depth + 1,
        angleStart + i * step,
        angleStart + (i + 1) * step
      );
    });
  }

  place(root, 0, 0, Math.PI * 2);
}

/*
  ÁRVORE H / V: layout clássico de organograma. Na horizontal,
  a profundidade vira X e os irmãos se espalham em Y; na
  vertical é o oposto.
*/
function layoutTree(
  root,
  childrenMap,
  spacing,
  direction
) {
  const levelGap = .17 * spacing;
  const leafGap = .11 * spacing;

  let cursor = 0;

  function place(node, depth) {
    const kids = childrenMap.get(node.id) || [];

    let cross;

    if (!kids.length) {
      cross = cursor * leafGap;
      cursor++;
    } else {
      kids.forEach(kid => place(kid, depth + 1));

      const first = kids[0]._cross;
      const last = kids[kids.length - 1]._cross;

      cross = (first + last) / 2;
    }

    node._cross = cross;

    const along = .14 + depth * levelGap;

    if (direction === "h") {
      node.x = along;
      node.y = cross;
    } else {
      node.y = along;
      node.x = cross;
    }
  }

  place(root, 0);

  /*
    Centraliza o eixo transversal em .5 e limpa o
    campo temporário usado só durante o cálculo.
  */
  const shift = .5 - root._cross;

  function finish(node) {
    if (direction === "h") {
      node.y += shift;
    } else {
      node.x += shift;
    }

    delete node._cross;

    (childrenMap.get(node.id) || [])
      .forEach(finish);
  }

  finish(root);
}

/*
  TIMELINE: todos os blocos em sequência, na ordem em que
  foram criados, com um leve ziguezague vertical pra não
  sobrepor os rótulos.
*/
function layoutTimeline(map, spacing) {
  const ordered = [...map.nodes];

  const gap = .14 * spacing;

  const startX =
    .5 - ((ordered.length - 1) * gap) / 2;

  ordered.forEach((node, i) => {
    node.x = startX + i * gap;
    node.y =
      .5 + (i % 2 === 0 ? -.05 : .05) * spacing;
  });
}

function applyLayout(layoutName) {
  const map = currentMap();

  if (!map) return;

  pushHistory();

  map.layout = layoutName;

  const spacing = (map.nodeSpacing || 60) / 60;
  const childrenMap = buildChildrenMap(map);
  const root = map.nodes.find(n => !n.parentId);

  if (root) {
    if (layoutName === "radial") {
      layoutRadial(root, childrenMap, spacing);
    } else if (layoutName === "tree-h") {
      layoutTree(root, childrenMap, spacing, "h");
    } else if (layoutName === "tree-v") {
      layoutTree(root, childrenMap, spacing, "v");
    } else if (layoutName === "timeline") {
      layoutTimeline(map, spacing);
    }

    /*
      Orgânico não mexe em nada — é o modo "livre".
      Os demais abrem tudo pra mostrar o resultado.
    */
    if (layoutName !== "organic") {
      openAllChildren(map, childrenMap);
    }
  }

  touchMapEdited();
  render();
  saveData();
  renderLayoutTab();
}

function renderLayoutTab() {
  const list =
    document.getElementById("layoutList");

  if (!list) return;

  const map = currentMap();
  const current = map?.layout || "radial";

  list.innerHTML = "";

  LAYOUTS.forEach(layout => {
    const row =
      document.createElement("button");

    row.type = "button";
    row.className =
      "layout-item" +
      (layout.key === current
        ? " active"
        : "");

    row.disabled = !map;

    row.innerHTML = `
      <span class="layout-info">
        <span class="layout-name">${layout.name}</span>
        <span class="layout-desc">${layout.desc}</span>
      </span>
      ${
        layout.key === current
          ? '<span class="layout-check">✓</span>'
          : ""
      }
    `;

    row.addEventListener("click", () => {
      if (!map) return;
      applyLayout(layout.key);
    });

    list.appendChild(row);
  });

  const orderToggle =
    document.getElementById(
      "showOrderNumbersToggle"
    );

  if (orderToggle) {
    orderToggle.disabled = !map;
    orderToggle.checked = !!(
      map && map.showOrderNumbers
    );
  }
}

function bindLayoutToggle() {
  const orderToggle =
    document.getElementById(
      "showOrderNumbersToggle"
    );

  if (!orderToggle) return;

  orderToggle.addEventListener(
    "change",
    () => {
      const map = currentMap();

      if (!map) return;

      map.showOrderNumbers =
        orderToggle.checked;

      touchMapEdited();
      saveData(false);
    }
  );
}
