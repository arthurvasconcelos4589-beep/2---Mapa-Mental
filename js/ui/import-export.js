/* ============================================================
   EXPORTAR / IMPORTAR
   Converte a anotação (HTML rico) pra Markdown e baixa um
   arquivo .md — de um bloco só ou do mapa inteiro, em forma
   de tópicos aninhados pela hierarquia. E o caminho inverso:
   pega um .md e recria os blocos.
   ============================================================ */

function htmlToMarkdown(html) {
  const container =
    document.createElement("div");

  container.innerHTML = html || "";

  function walk(node) {
    if (
      node.nodeType ===
      Node.TEXT_NODE
    ) {
      return node.textContent;
    }

    if (
      node.nodeType !==
      Node.ELEMENT_NODE
    ) {
      return "";
    }

    const children = Array.from(
      node.childNodes
    )
      .map(walk)
      .join("");

    switch (node.tagName) {
      case "B":
      case "STRONG":
        return `**${children}**`;

      case "I":
      case "EM":
        return `*${children}*`;

      case "U":
        return `_${children}_`;

      case "CODE":
        return `\`${children}\``;

      case "BR":
        return "\n";

      case "DIV":
        if (
          node.classList.contains(
            "note-block"
          )
        ) {
          return `\n\`\`\`\n${children}\n\`\`\`\n`;
        }
        return `${children}\n`;

      case "UL":
        return (
          Array.from(node.children)
            .map(
              li =>
                `- ${walk(li).trim()}\n`
            )
            .join("") + "\n"
        );

      case "OL":
        return (
          Array.from(node.children)
            .map(
              (li, i) =>
                `${i + 1}. ${walk(li).trim()}\n`
            )
            .join("") + "\n"
        );

      case "LI":
        return children;

      default:
        return children;
    }
  }

  return Array.from(
    container.childNodes
  )
    .map(walk)
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function slugifyFilename(name) {
  const slug = (name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");

  return slug || "sem-titulo";
}

function downloadTextFile(
  filename,
  content
) {
  const blob = new Blob([content], {
    type: "text/markdown;charset=utf-8"
  });

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

/*
  Exporta só o bloco selecionado: título + anotação.
*/
async function exportSelectedBlock() {
  if (!AppState.selectedId) {
    await showAlert(
      "Selecione um bloco pra exportar."
    );
    return;
  }

  const node =
    getNode(AppState.selectedId);

  if (!node) return;

  const noteMarkdown =
    htmlToMarkdown(node.note);

  const content =
    `# ${node.title}\n\n` +
    (noteMarkdown ||
      "_Sem anotação._");

  downloadTextFile(
    `${slugifyFilename(node.title)}.md`,
    content
  );
}

/*
  Exporta o mapa inteiro: um tópico por bloco, aninhado
  pela hierarquia (pai/filho vira título/subtítulo), cada
  um seguido da própria anotação.
*/
async function exportCurrentMap() {
  const map = currentMap();

  if (!map) {
    await showAlert(
      "Nenhum mapa selecionado."
    );
    return;
  }

  const root = map.nodes.find(
    node => !node.parentId
  );

  if (!root) {
    await showAlert(
      "Este mapa não tem um bloco principal."
    );
    return;
  }

  const lines = [
    `# ${map.name}`,
    ""
  ];

  function walk(node, depth) {
    const heading =
      "#".repeat(
        Math.min(depth + 2, 6)
      );

    lines.push(
      `${heading} ${node.title}`
    );

    const noteMarkdown =
      htmlToMarkdown(node.note);

    if (noteMarkdown) {
      lines.push(
        "",
        noteMarkdown,
        ""
      );
    } else {
      lines.push("");
    }

    childrenOf(node.id).forEach(
      child => walk(child, depth + 1)
    );
  }

  walk(root, 0);

  downloadTextFile(
    `${slugifyFilename(map.name)}.md`,
    lines
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/* ============================================================
   IMPORTAR
   Caminho inverso: pega um .md (o nosso próprio formato de
   exportação, com títulos # ## ### virando hierarquia) e
   recria os blocos e a anotação formatada.
   ============================================================ */

function markdownToHtml(markdown) {
  if (!markdown) return "";

  /*
    Blocos de código cercados (```...```) primeiro, senão a
    sintaxe de negrito/itálico dentro deles bagunçaria tudo.
  */
  const withBlocks = markdown.replace(
    /```\n?([\s\S]*?)\n?```/g,
    (match, code) => {
      const escaped = escapeHtml(
        code
      ).replace(/\n/g, "<br>");

      return `\u0000${escaped}\u0000`;
    }
  );

  const rawLines = withBlocks.split(
    "\n"
  );

  const htmlParts = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];

    if (
      line.startsWith("\u0000") &&
      line.endsWith("\u0000")
    ) {
      const inner = line.slice(
        1,
        -1
      );

      htmlParts.push(
        `<div class="note-block">${inner}</div>`
      );

      i++;
      continue;
    }

    /*
      Linhas de lista consecutivas viram um único
      <ul>/<ol> agrupando os <li>.
    */
    if (/^-\s+/.test(line)) {
      const items = [];

      while (
        i < rawLines.length &&
        /^-\s+/.test(rawLines[i])
      ) {
        items.push(
          `<li>${formatInlineMarkdown(
            rawLines[i].replace(
              /^-\s+/,
              ""
            )
          )}</li>`
        );

        i++;
      }

      htmlParts.push(
        `<ul>${items.join("")}</ul>`
      );

      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];

      while (
        i < rawLines.length &&
        /^\d+\.\s+/.test(
          rawLines[i]
        )
      ) {
        items.push(
          `<li>${formatInlineMarkdown(
            rawLines[i].replace(
              /^\d+\.\s+/,
              ""
            )
          )}</li>`
        );

        i++;
      }

      htmlParts.push(
        `<ol>${items.join("")}</ol>`
      );

      continue;
    }

    htmlParts.push(
      formatInlineMarkdown(line)
    );

    i++;
  }

  return htmlParts.join("<br>");
}

function formatInlineMarkdown(
  line
) {
  let escaped = escapeHtml(line);

  escaped = escaped
    .replace(
      /\*\*(.+?)\*\*/g,
      "<b>$1</b>"
    )
    .replace(
      /`(.+?)`/g,
      '<code class="note-inline-code">$1</code>'
    )
    .replace(
      /_(.+?)_/g,
      "<u>$1</u>"
    )
    .replace(
      /(^|[^*])\*([^*]+?)\*(?!\*)/g,
      "$1<i>$2</i>"
    );

  return escaped;
}

/*
  Lê o arquivo .md e separa em itens por título (# até
  ######), guardando o texto entre um título e o próximo
  como o corpo daquele item.
*/
function parseMarkdownOutline(
  text
) {
  const lines = text.split(
    /\r?\n/
  );

  const items = [];
  let current = null;

  lines.forEach(line => {
    const match = line.match(
      /^(#{1,6})\s+(.*)$/
    );

    if (match) {
      current = {
        level: match[1].length,
        title: match[2].trim(),
        bodyLines: []
      };

      items.push(current);
    } else if (current) {
      current.bodyLines.push(line);
    }
  });

  return items;
}

/*
  Monta a árvore (título + anotação + filhos) a partir dos
  itens. Se o arquivo tiver mais de um título no nível mais
  alto (sem um título "guarda-chuva" único), cria uma raiz
  sintética pra não perder nada.
*/
function buildTreeFromOutline(
  items,
  fallbackTitle
) {
  if (items.length === 0) {
    return null;
  }

  const minLevel = Math.min(
    ...items.map(
      item => item.level
    )
  );

  const topCount = items.filter(
    item => item.level === minLevel
  ).length;

  const needsSyntheticRoot =
    topCount > 1;

  const syntheticRoot =
    needsSyntheticRoot
      ? {
          title: fallbackTitle,
          note: "",
          children: []
        }
      : null;

  const stack = syntheticRoot
    ? [
        {
          level: minLevel - 1,
          node: syntheticRoot
        }
      ]
    : [];

  let rootData = syntheticRoot;

  items.forEach(item => {
    const bodyText = item.bodyLines
      .join("\n")
      .trim();

    const note = bodyText
      ? markdownToHtml(bodyText)
      : "";

    const nodeData = {
      title: item.title,
      note,
      children: []
    };

    while (
      stack.length &&
      stack[stack.length - 1]
        .level >= item.level
    ) {
      stack.pop();
    }

    if (stack.length === 0) {
      rootData = nodeData;
    } else {
      stack[
        stack.length - 1
      ].node.children.push(
        nodeData
      );
    }

    stack.push({
      level: item.level,
      node: nodeData
    });
  });

  return rootData;
}

function pickMarkdownFile() {
  return new Promise(resolve => {
    const input =
      document.createElement(
        "input"
      );

    input.type = "file";
    input.accept =
      ".md,text/markdown,text/plain";
    input.style.display = "none";

    input.addEventListener(
      "change",
      () => {
        const file =
          input.files[0];

        input.remove();

        if (!file) {
          resolve(null);
          return;
        }

        const reader =
          new FileReader();

        reader.onload = () => {
          resolve({
            name: file.name,
            text: String(
              reader.result
            )
          });
        };

        reader.onerror = () =>
          resolve(null);

        reader.readAsText(file);
      }
    );

    document.body.appendChild(
      input
    );

    input.click();
  });
}

function fileNameWithoutExt(
  name
) {
  return (
    name || "mapa-importado"
  ).replace(/\.[^.]+$/, "");
}

/*
  Cria recursivamente os blocos filhos de uma árvore
  importada dentro do mapa informado.
*/
function insertImportedNode(
  treeNode,
  parentId,
  map
) {
  const node = createNodeData(
    parentId,
    treeNode.title ||
      "SEM TÍTULO",
    false
  );

  node.note = treeNode.note;

  map.nodes.push(node);

  const parent = getNode(
    parentId
  );

  if (parent) {
    parent.childrenOpen = true;
  }

  treeNode.children.forEach(
    child =>
      insertImportedNode(
        child,
        node.id,
        map
      )
  );

  return node;
}

/*
  Importa um bloco (e seus sub-tópicos) DENTRO do bloco
  selecionado no momento.
*/
async function importBlock() {
  if (!AppState.selectedId) {
    await showAlert(
      "Selecione um bloco pra importar dentro dele."
    );
    return;
  }

  const file =
    await pickMarkdownFile();

  if (!file) return;

  const items =
    parseMarkdownOutline(file.text);

  if (items.length === 0) {
    await showAlert(
      "Não encontrei nenhum título (#) nesse arquivo."
    );
    return;
  }

  const tree = buildTreeFromOutline(
    items,
    fileNameWithoutExt(file.name)
  );

  const map = currentMap();

  if (!map) return;

  pushHistory();

  const topNode = createNodeData(
    AppState.selectedId,
    tree.title || "SEM TÍTULO",
    false
  );

  topNode.note = tree.note;

  map.nodes.push(topNode);

  const parent = getNode(
    AppState.selectedId
  );

  if (parent) {
    parent.childrenOpen = true;
  }

  tree.children.forEach(child =>
    insertImportedNode(
      child,
      topNode.id,
      map
    )
  );

  AppState.selectedId =
    topNode.id;

  touchMapEdited();
  render();
  saveData();
}

/*
  Importa um arquivo .md como um MAPA NOVO inteiro
  (título de nível mais alto vira o bloco principal).
*/
async function importMap() {
  const file =
    await pickMarkdownFile();

  if (!file) return;

  const items =
    parseMarkdownOutline(file.text);

  if (items.length === 0) {
    await showAlert(
      "Não encontrei nenhum título (#) nesse arquivo."
    );
    return;
  }

  const tree = buildTreeFromOutline(
    items,
    fileNameWithoutExt(file.name)
  );

  const map =
    AppState.createEmptyMap(
      tree.title ||
        fileNameWithoutExt(
          file.name
        )
    );

  /*
    Já registra o mapa como atual ANTES de criar os blocos,
    já que createNodeData/getNode dependem do mapa atual
    pra calcular a posição de cada um.
  */
  AppState.maps.push(map);
  AppState.currentMapId = map.id;

  const root = createNodeData(
    null,
    tree.title || "MAPA IMPORTADO",
    true
  );

  root.note = tree.note;

  map.root = root.id;
  map.nodes.push(root);

  tree.children.forEach(child =>
    insertImportedNode(
      child,
      root.id,
      map
    )
  );

  resetSelection();
  renderAll();
  saveData();
}
