/* ============================================================
   LOG DE ATUALIZAÇÕES
   ============================================================ */

const APP_VERSION = "v1.14";

const UPDATE_LOG = [
  {
    version: "v1.14",
    changes: [
      "Painel do log de atualizações agora tem tamanho fixo, não muda mais conforme o texto",
      "Scrollbars do log com um respiro do texto, sem encostar"
    ]
  },
  {
    version: "v1.13",
    changes: [
      "Log de atualizações redesenhado: lista de versões do lado, clique numa pra ver o que mudou nela"
    ]
  },
  {
    version: "v1.12",
    changes: [
      "Linhas de conexão agora acompanham o mapa durante o arrasto da tela vazia (e também ao arrastar um bloco)",
      "Scrollbars agora seguem a cor do tema atual"
    ]
  },
  {
    version: "v1.11",
    changes: [
      "Site otimizado: blocos e linhas agora usam propriedades CSS compostas (mais leve, sem travar a página)",
      "Mapa fica parado (não estica/encolhe mais) ao abrir ou fechar as abas laterais",
      "Ícone de configurações movido para o botão que abre/fecha o menu, agora uma engrenagem",
      "Removida a dica no canto inferior esquerdo do mapa",
      "Versão de volta ao lado do botão \"?\"",
      "Mapa agora tem um limite de tamanho — ao afastar o zoom além dele, a câmera recentraliza aos poucos"
    ]
  },
  {
    version: "v1.1",
    changes: [
      "Tema Jarvis redesenhado — agora escuro, estilo HUD do Homem de Ferro",
      "Temas reorganizados: 4 escuros (Dark Modern, Dracula, Ultron, Jarvis) e 2 claros (Light Modern, Creme com Marrom)",
      "Hover da lista de mapas mais sutil, sem o efeito de quadrado",
      "Novos ajustes de blocos na aba Nós: largura, arredondamento, transparência e cantos decorativos",
      "Atalhos de teclado revisados, sem conflito com o sistema, e agora personalizáveis",
      "Zoom bem mais amplo, tanto pra aproximar quanto pra afastar",
      "Arrastar a tela vazia agora move a câmera",
      "Ícone de configurações trocado por uma engrenagem",
      "Log de atualizações adicionado"
    ]
  },
  {
    version: "v1.0",
    changes: [
      "Lançamento do painel de configurações: mapas, temas, layouts, tipografia e atalhos"
    ]
  }
];

function buildChangelogRoot() {
  if (
    document.getElementById(
      "changelogOverlay"
    )
  ) {
    return;
  }

  const overlay =
    document.createElement("div");

  overlay.id = "changelogOverlay";
  overlay.className = "dialog-overlay";
  overlay.hidden = true;

  overlay.innerHTML = `
    <div class="changelog-box" role="dialog" aria-modal="true">
      <div class="changelog-header">
        <span>Log de atualizações</span>
        <button type="button" id="changelogCloseBtn" class="icon-button">×</button>
      </div>
      <div class="changelog-body">
        <div class="changelog-versions" id="changelogVersions"></div>
        <div class="changelog-details" id="changelogDetails"></div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document
    .getElementById("changelogCloseBtn")
    .addEventListener(
      "click",
      closeChangelog
    );

  overlay.addEventListener(
    "click",
    event => {
      if (event.target === overlay) {
        closeChangelog();
      }
    }
  );

  document.addEventListener(
    "keydown",
    event => {
      if (
        event.key === "Escape" &&
        !overlay.hidden
      ) {
        closeChangelog();
      }
    }
  );
}

function closeChangelog() {
  const overlay =
    document.getElementById(
      "changelogOverlay"
    );

  if (overlay) overlay.hidden = true;
}

function isChangelogOpen() {
  const overlay =
    document.getElementById(
      "changelogOverlay"
    );

  return !!overlay && !overlay.hidden;
}

function renderChangelogDetails(
  version
) {
  const entry =
    UPDATE_LOG.find(
      e => e.version === version
    ) || UPDATE_LOG[0];

  document
    .querySelectorAll(
      ".changelog-version-item"
    )
    .forEach(btn => {
      btn.classList.toggle(
        "active",
        btn.dataset.version ===
          entry.version
      );
    });

  const details =
    document.getElementById(
      "changelogDetails"
    );

  const items = entry.changes
    .map(
      change =>
        `<li>${escapeHtml(change)}</li>`
    )
    .join("");

  details.innerHTML = `
    <div class="changelog-details-title">${entry.version}</div>
    <ul class="changelog-details-list">${items}</ul>
  `;
}

function showUpdateLog() {
  buildChangelogRoot();

  const versionsList =
    document.getElementById(
      "changelogVersions"
    );

  versionsList.innerHTML = "";

  UPDATE_LOG.forEach(entry => {
    const btn =
      document.createElement("button");

    btn.type = "button";
    btn.className =
      "changelog-version-item";
    btn.dataset.version = entry.version;
    btn.textContent = entry.version;

    btn.addEventListener(
      "click",
      () =>
        renderChangelogDetails(
          entry.version
        )
    );

    versionsList.appendChild(btn);
  });

  renderChangelogDetails(
    UPDATE_LOG[0].version
  );

  document.getElementById(
    "changelogOverlay"
  ).hidden = false;
}
