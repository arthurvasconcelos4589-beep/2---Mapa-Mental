# Mapa Mental

Aplicativo web de anotações visuais em forma de mapa mental. Feito só com HTML, CSS e JavaScript puro: sem Node, sem bibliotecas e sem build.

## Como abrir

1. Abra a pasta do projeto no VSCode.
2. Com a extensão **Live Server** instalada, clique com o botão direito no `index.html` e escolha **Open with Live Server**.

## Onde ficam os dados

Tudo é salvo automaticamente no `localStorage` do navegador (chave `mapa-anotacoes-v4`). Os dados ficam no navegador e no endereço usados para abrir o app: trocar de navegador ou de porta do Live Server mostra um app vazio. Use Exportar/Importar (.md) para levar mapas de um lugar para outro.

## Estrutura

```text
├── index.html              estrutura da página
├── css/
│   ├── base.css            variáveis e estilos gerais
│   ├── themes.css          temas de cor
│   ├── board.css           área do mapa e conexões
│   ├── nodes.css           blocos
│   ├── sidebar-left.css    painel de configurações (esquerda)
│   ├── sidebar-right.css   painel de anotação (direita)
│   ├── toolbar.css         barra de ferramentas do mapa
│   ├── dialog.css          diálogos, log de atualizações e janela de mapas
│   └── sidebar.css         (arquivo antigo, não é carregado pelo index.html)
└── js/
    ├── app.js              inicialização e loop principal
    ├── core/               state.js (estado), history.js (desfazer/refazer)
    ├── graph/              geometry.js, connections.js, layout.js
    ├── storage/            storage.js (salvamento no navegador)
    └── ui/                 blocos, painéis, temas, atalhos, zoom, mapas,
                            importação/exportação, editor de anotação,
                            diálogos e changelog.js (log de atualizações)
```

## Organização do código

- Os scripts são carregados na ordem do `index.html`, sem módulos: funções de um arquivo são visíveis nos outros, mas só depois de ele ser carregado. Código que roda na hora da carga não deve chamar funções de arquivos que vêm depois.
- A versão do app e o log de atualizações ficam em `js/ui/changelog.js`.
- Mapas: o selo do mapa atual (barra lateral esquerda) abre a janela de mapas (`js/ui/maps.js`), onde dá para trocar, criar, excluir, importar, exportar, reordenar e mudar cor ou imagem.
