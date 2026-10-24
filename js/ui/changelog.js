/* ============================================================
   LOG DE ATUALIZAÇÕES
   ============================================================ */

const APP_VERSION = "v3.4.0";

const UPDATE_LOG = [
  {
    version: "v3.4.0",
    changes: [
      "Desfazer e refazer: agora Ctrl+Z desfaz a última ação nos blocos (arrastar, criar, excluir, duplicar, reconectar, renomear, aplicar layout, escrever numa anotação...) e Ctrl+Y ou Ctrl+Shift+Z refaz. Dentro do campo de anotação o Ctrl+Z continua desfazendo só o texto que você digita. As teclas podem ser mudadas na aba Atalhos",
      "Corrigido: só clicar num bloco não conta mais como uma ação no histórico (antes cada clique guardava um passo igual ao anterior); agora o passo só é guardado quando o bloco realmente se move",
      "Novo atalho / (Ir para bloco): abre uma lista com busca (ignora acentos e maiúsculas, mostra de qual bloco cada um faz parte) e leva a câmera até o bloco escolhido, com zoom de 120%, abrindo os blocos de cima se estiverem fechados. Enter escolhe o primeiro resultado",
      "Renomear atualiza os links: ao renomear um bloco, os links [[nome]] das anotações que apontavam pra ele passam a usar o novo nome. Com nomes repetidos, vale o primeiro bloco. Ctrl+Z desfaz o renomear e os links juntos",
      "Autocompletar nos links: enquanto você digita dentro de um link, aparece uma lista de blocos parecidos. Use ↑ e ↓, Enter ou Tab (ou clique) para escolher — o link recebe o nome exato do bloco e o cursor sai dele — e Esc para fechar a lista",
      "Digitar [[ à mão agora cria o link automaticamente, igual ao botão [[ ]]"
    ]
  },
  {
    version: "v3.3.0",
    changes: [
      "Filhos seguem o bloco: ao arrastar um bloco, os filhos e netos vão atrás devagar, mantendo a distância que tinham, e ficam na nova posição quando você solta. Cada um segue o próprio pai, então os de baixo atrasam mais. Segure Shift ao arrastar pra mover só aquele bloco, sem os filhos",
      "Em Estilo > Movimento: novo interruptor \"Filhos seguem o bloco\" e slider \"Peso dos filhos\" (quanto maior, mais devagar eles seguem)",
      "Enquanto você arrasta um bloco, os outros blocos agora continuam se movendo normalmente (antes todos paravam durante o arraste)",
      "Links entre blocos nas anotações: o novo botão [[ ]] na barra da anotação transforma o texto selecionado em link (sem seleção, entra um texto de exemplo pra você digitar o nome por cima; aperte a seta → no fim do nome pra sair do link e continuar escrevendo). Clicar no link leva até o bloco com aquele nome, ignorando maiúsculas e acentos; com nomes repetidos vale o primeiro, e se o bloco não existir o app avisa. Renomear o bloco quebra o link",
      "Os links também vão na exportação e importação em Markdown, escritos como [[nome]]"
    ]
  },
  {
    version: "v3.2.0",
    changes: [
      "Reconectar bloco: agora dá pra trocar o pai de um bloco sem apagar e reescrever. Selecione o bloco, aperte M (ou o botão Reconectar na barra de cima) e clique no novo pai. Os filhos do bloco vão junto, ele vai pro fim da fila do novo pai (o número da linha acompanha) e continua no mesmo lugar da tela — só a linha muda. A tecla M pode ser mudada na aba Atalhos",
      "No modo Reconectar, Ctrl+F abre uma busca pelo nome do bloco (mostrando de qual bloco cada um faz parte), útil quando o novo pai está longe ou escondido. Enter escolhe o primeiro resultado e Esc cancela",
      "O app avisa se você tentar mover um bloco pra dentro dele mesmo ou de um dos filhos dele, e o bloco principal não pode ser reconectado"
    ]
  },
  {
    version: "v3.1.0",
    changes: [
      "Zoom ao selecionar bloco: com a barra de anotação aberta, ao selecionar um bloco a câmera aproxima nele (zoom de 120%) e a barra de configurações fecha sozinha se estiver aberta. Se o bloco já estava selecionado e a anotação estava fechada, o zoom acontece quando você abrir a anotação. A câmera não fica presa: você pode mover ou dar zoom à vontade depois. Dá pra desativar em Estilo > Movimento > Zoom ao selecionar bloco",
      "Novo atalho F (Focar no bloco): leva a câmera até o bloco selecionado com zoom de 120%, útil quando você já saiu do zoom. Funciona mesmo com o zoom automático desativado, e dá pra mudar a tecla na aba Atalhos",
      "Sensibilidade do zoom: novo botão ao lado do zoom (canto inferior) com uma barra de 1% a 20% que define quanto cada giro da roda do mouse ou clique em − e + aproxima ou afasta. O padrão continua 5%",
      "O zoom agora anda em passos de 1% (antes era de 5 em 5%), pra que a sensibilidade funcione com qualquer valor",
      "Mais espaço para colocar blocos: a área de trabalho ficou bem maior e vai quase até o limite do zoom mais afastado"
    ]
  },
  {
    version: "v3.0.1",
    changes: [
      "Corrigido: o botão Excluir da barra superior não fazia nada. Os botões de exportar e importar bloco estavam travados pelo mesmo motivo — agora os três funcionam",
      "Corrigido: os números de ordem nas conexões agora acompanham o zoom — encolhem e crescem junto com o mapa, em vez de ficarem enormes quando você afasta a câmera",
      "Os mapas agora abrem numa janela no meio da tela: clique no selo do mapa atual (barra lateral) pra ver a lista com busca, criar, importar e exportar mapa, mudar cor, imagem e ordem, e excluir (com confirmação). Clique num mapa pra selecioná-lo e use \"Ir para este mapa\" pra trocar — a janela fecha sozinha. O atalho Ctrl+K também abre essa janela com a busca pronta",
      "O selo do mapa atual na barra lateral agora só mostra o mapa em que você está e abre essa janela (o menu que abria dentro da barra lateral foi removido)",
      "Todas as versões do log agora têm 3 números (ex.: v2.1 virou v2.1.0 e v2.11 virou v2.1.1)"
    ]
  },
  {
    version: "v3.0.0",
    changes: [
      "Painel de configurações reformulado por completo",
      "A aba Mapas virou o próprio selo do mapa atual: clique nele pra trocar de mapa, criar, excluir, importar, exportar, reordenar e mudar a cor ou colocar uma imagem",
      "Agora são só 4 abas principais: Tema, Layout, Estilo e Atalhos",
      "Nova barra de sub-abas dentro de cada aba principal, organizando tudo em seções",
      "Tema dividido em Temas Escuros / Temas Claros",
      "Layout dividido em Ordem (os 5 estilos) e Numeração — que agora tem borda do número, permitir renumerar e tamanho do número, só aparecendo quando a numeração está ativada",
      "\"Nós\" virou \"Estilo\", com 4 sub-abas: Tipografia, Espaçamento, Forma e Movimento",
      "Tipografia: fonte dos blocos (Padrão/Serifada/Monoespaçada/Arredondada), título em maiúsculas com fonte de destaque, tamanho da fonte, e quebra de linha no título (até 3 linhas)",
      "Espaçamento: entre nós e do nó até a linha de conexão",
      "Forma: largura E altura do bloco separadas, bordas redondas (os cantos decorativos agora acompanham o arredondamento), espessura de linha, transparência, e um novo brilho regulável nos selecionados",
      "Movimento: interruptor geral pra ligar/desligar, e um novo padrão de movimento (Circular ou Infinito/8)",
      "Atalhos continua como estava"
    ]
  },
  {
    version: "v2.1.3",
    changes: [
      "Corrigido: números de ordem (e as linhas) ficavam escondidos atrás dos blocos — principalmente perto do bloco central, por ele ser maior. Agora as conexões sempre ficam visíveis por cima de qualquer bloco, em qualquer nível"
    ]
  },
  {
    version: "v2.1.2",
    changes: [
      "Paletas de cor redesenhadas: cada uma das 8 posições agora tem um papel fixo (Destaque, Atenção/Erro, Sucesso, Aviso, Informação, Especial, Técnico, Secundário) — o mouse sobre a cor mostra esse nome. Trocar de tema muda o tom, mas o sentido de cada cor se mantém",
      "Botões de exportar/importar bloco na barra de ferramentas viraram ícones compactos (evita quebrar em telas menores)",
      "Botões de exportar/importar mapa reorganizados lado a lado na aba Mapas",
      "Números de ordem nas conexões agora mostram uma dica ao passar o mouse (\"Clique para mudar a ordem\")"
    ]
  },
  {
    version: "v2.1.1",
    changes: [
      "Corrigido: apertar Enter dentro de um bloco de destaque (markdown) estava cortando em outro bloco separado, deixando uma linha estranha no meio da caixa. Agora Enter só quebra a linha e continua no mesmo bloco"
    ]
  },
  {
    version: "v2.1.0",
    changes: [
      "Números de ordem nas conexões: ative em Layout > \"Numerar conexões\", clique no número pra trocar. Os layouts Radial e Árvore H/V agora organizam os blocos seguindo essa sequência — ótimo pra ensinar passo a passo",
      "Área de anotações 40px mais larga",
      "Novos botões de lista ordenada e não ordenada na barra de anotação",
      "Fechamento automático de pares tipo VSCode: abrir ( { [ \" ' ` já completa o par e deixa o cursor no meio; fechar por cima em vez de duplicar",
      "Exportação e importação de anotações agora também reconhecem listas"
    ]
  },
  {
    version: "v2.0.4",
    changes: [
      "Novos botões \"Importar\" (bloco selecionado) na barra de ferramentas e \"Importar mapa (.md)\" na aba Mapas",
      "A importação lê o mesmo formato que a exportação gera: os títulos (#, ##, ###...) viram a hierarquia de blocos de novo, e negrito/itálico/sublinhado/código/blocos de destaque voltam a ser formatação de verdade",
      "Importar bloco cria os blocos dentro do bloco selecionado; importar mapa cria um mapa novo inteiro"
    ]
  },
  {
    version: "v2.0.3",
    changes: [
      "Criação de bloco inteligente: ao clicar em \"+ Bloco\", o próximo clique no mapa decide onde ele nasce (Esc cancela)",
      "Cores da anotação agora são por posição na paleta, não por valor fixo — se você trocar de tema, o texto já colorido acompanha a cor que estiver naquele mesmo lugar na nova paleta",
      "Adicionada a versão v2.0.0 que estava faltando no Update Log",
      "Descrições removidas da lista de temas — só o nome agora",
      "Botão \"Restaurar atalhos padrão\" corrigido — tinha uma regra de CSS conflitante deixando ele mais largo que o painel",
      "Novos botões: \"Exportar\" (bloco selecionado) na barra de ferramentas, e \"Exportar mapa atual\" na aba Mapas — geram um arquivo .md legível, com a anotação convertida pra markdown"
    ]
  },
  {
    version: "v2.0.2",
    changes: [
      "Corrigido bug grave: afastar muito o zoom espalhava e quebrava os blocos e as linhas. A causa era o sistema que afasta blocos sobrepostos, que amplificava demais a correção em zooms bem baixos — agora ele roda em coordenadas independentes de zoom",
      "Nova seção \"Movimento\" na aba Nós: intensidade do balanço dos blocos (0 = totalmente parado) e velocidade separadamente"
    ]
  },
  {
    version: "v2.0.1",
    changes: [
      "Botões da barra de anotação agora centralizados, sem espaço sobrando do lado",
      "Botão de limpar formatação saiu da barra e virou atalho de teclado (Ctrl+\\, remapeável na aba Atalhos)",
      "Botões de Renomear e Salvar removidos — clique no nome do bloco (dentro da anotação) pra renomear, e tudo salva sozinho",
      "Bloco de destaque redesenhado: sem a linha lateral que não combinava, agora com borda fina ao redor tipo bloco de código de chat de IA, ocupando só uma linha até quebrar naturalmente"
    ]
  },
  {
    version: "v2.0.0",
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
    version: "v1.1.4",
    changes: [
      "Painel do log de atualizações agora tem tamanho fixo, não muda mais conforme o texto",
      "Scrollbars do log com um respiro do texto, sem encostar"
    ]
  },
  {
    version: "v1.1.3",
    changes: [
      "Log de atualizações redesenhado: lista de versões do lado, clique numa pra ver o que mudou nela"
    ]
  },
  {
    version: "v1.1.2",
    changes: [
      "Linhas de conexão agora acompanham o mapa durante o arrasto da tela vazia (e também ao arrastar um bloco)",
      "Scrollbars agora seguem a cor do tema atual"
    ]
  },
  {
    version: "v1.1.1",
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
    version: "v1.1.0",
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
    version: "v1.0.0",
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
