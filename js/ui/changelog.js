/* ============================================================
   LOG DE ATUALIZAÇÕES
   ============================================================ */

const APP_VERSION = "v2.13";

const UPDATE_LOG = [
  {
    version: "v2.13",
    changes: [
      "Corrigido: números de ordem (e as linhas) ficavam escondidos atrás dos blocos — principalmente perto do bloco central, por ele ser maior. Agora as conexões sempre ficam visíveis por cima de qualquer bloco, em qualquer nível"
    ]
  },
  {
    version: "v2.12",
    changes: [
      "Paletas de cor redesenhadas: cada uma das 8 posições agora tem um papel fixo (Destaque, Atenção/Erro, Sucesso, Aviso, Informação, Especial, Técnico, Secundário) — o mouse sobre a cor mostra esse nome. Trocar de tema muda o tom, mas o sentido de cada cor se mantém",
      "Botões de exportar/importar bloco na barra de ferramentas viraram ícones compactos (evita quebrar em telas menores)",
      "Botões de exportar/importar mapa reorganizados lado a lado na aba Mapas",
      "Números de ordem nas conexões agora mostram uma dica ao passar o mouse (\"Clique para mudar a ordem\")"
    ]
  },
  {
    version: "v2.11",
    changes: [
      "Corrigido: apertar Enter dentro de um bloco de destaque (markdown) estava cortando em outro bloco separado, deixando uma linha estranha no meio da caixa. Agora Enter só quebra a linha e continua no mesmo bloco"
    ]
  },
  {
    version: "v2.1",
    changes: [
      "Números de ordem nas conexões: ative em Layout > \"Numerar conexões\", clique no número pra trocar. Os layouts Radial e Árvore H/V agora organizam os blocos seguindo essa sequência — ótimo pra ensinar passo a passo",
      "Área de anotações 40px mais larga",
      "Novos botões de lista ordenada e não ordenada na barra de anotação",
      "Fechamento automático de pares tipo VSCode: abrir ( { [ \" ' ` já completa o par e deixa o cursor no meio; fechar por cima em vez de duplicar",
      "Exportação e importação de anotações agora também reconhecem listas"
    ]
  },
  {
    version: "v2.04",
    changes: [
      "Novos botões \"Importar\" (bloco selecionado) na barra de ferramentas e \"Importar mapa (.md)\" na aba Mapas",
      "A importação lê o mesmo formato que a exportação gera: os títulos (#, ##, ###...) viram a hierarquia de blocos de novo, e negrito/itálico/sublinhado/código/blocos de destaque voltam a ser formatação de verdade",
      "Importar bloco cria os blocos dentro do bloco selecionado; importar mapa cria um mapa novo inteiro"
    ]
  },
  {
    version: "v2.03",
    changes: [
      "Criação de bloco inteligente: ao clicar em \"+ Bloco\", o próximo clique no mapa decide onde ele nasce (Esc cancela)",
      "Cores da anotação agora são por posição na paleta, não por valor fixo — se você trocar de tema, o texto já colorido acompanha a cor que estiver naquele mesmo lugar na nova paleta",
      "Adicionada a versão v2.0 que estava faltando no Update Log",
      "Descrições removidas da lista de temas — só o nome agora",
      "Botão \"Restaurar atalhos padrão\" corrigido — tinha uma regra de CSS conflitante deixando ele mais largo que o painel",
      "Novos botões: \"Exportar\" (bloco selecionado) na barra de ferramentas, e \"Exportar mapa atual\" na aba Mapas — geram um arquivo .md legível, com a anotação convertida pra markdown"
    ]
  },
  {
    version: "v2.02",
    changes: [
      "Corrigido bug grave: afastar muito o zoom espalhava e quebrava os blocos e as linhas. A causa era o sistema que afasta blocos sobrepostos, que amplificava demais a correção em zooms bem baixos — agora ele roda em coordenadas independentes de zoom",
      "Nova seção \"Movimento\" na aba Nós: intensidade do balanço dos blocos (0 = totalmente parado) e velocidade separadamente"
    ]
  },
  {
    version: "v2.01",
    changes: [
      "Botões da barra de anotação agora centralizados, sem espaço sobrando do lado",
      "Botão de limpar formatação saiu da barra e virou atalho de teclado (Ctrl+\\, remapeável na aba Atalhos)",
      "Botões de Renomear e Salvar removidos — clique no nome do bloco (dentro da anotação) pra renomear, e tudo salva sozinho",
      "Bloco de destaque redesenhado: sem a linha lateral que não combinava, agora com borda fina ao redor tipo bloco de código de chat de IA, ocupando só uma linha até quebrar naturalmente"
    ]
  },
  {
    version: "v2.0",
    changes: [
      "Editor de anotações totalmente novo: negrito, itálico, sublinhado e código em linha",
      "Cor de texto com paleta própria por tema (Dracula usa as cores de sintaxe do VSCode, Jarvis usa tons de azul/ciano, e assim por diante)",
      "Bloco de destaque estilo markdown — se a linha estiver vazia ele entra ali, senão pula pra uma linha nova",
      "Fonte monoespaçada na anotação: tudo continua alinhado em colunas e linhas mesmo com formatação",
      "Toolbar de anotação pequena e limpa, no mesmo estilo da aba de configurações",
      "Tudo que é escrito ou formatado na anotação salva automaticamente",
      "Tab agora indenta (3 espaços) dentro da anotação em vez de sair do campo — e isso é remapeável na aba Atalhos, numa seção nova só do editor",
      "Sugestões e sublinhado de correção ortográfica desativados nos campos de texto do app",
      "Botão de excluir bloco blindado com tratamento de erro, pra nunca falhar em silêncio"
    ]
  },
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
