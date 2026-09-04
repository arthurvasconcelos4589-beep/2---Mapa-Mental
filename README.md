# Mapa de Anotações

Projeto pessoal de anotações visuais.

## Estrutura

```text
mapa_anotacoes_vscode/
├── index.html
├── assets/
├── css/
│   ├── base.css
│   ├── board.css
│   ├── nodes.css
│   ├── sidebar.css
│   └── toolbar.css
└── js/
    ├── app.js
    ├── core/
    │   └── state.js
    ├── graph/
    │   ├── geometry.js
    │   └── connections.js
    ├── storage/
    │   └── storage.js
    └── ui/
        ├── nodes.js
        ├── sidebar.js
        └── toolbar.js
```

## Como abrir

1. Abra esta pasta no VSCode.
2. Abra `index.html`.
3. Recomenda-se usar a extensão **Live Server** para desenvolvimento.
4. Clique com o botão direito em `index.html` → **Open with Live Server**.

Não é necessário instalar Node.js para esta versão.

## Organização do código

- `index.html`: apenas estrutura da página.
- `css/`: estilos, separados por área.
- `js/core/state.js`: estado e dados iniciais.
- `js/graph/geometry.js`: cálculo geométrico das linhas.
- `js/graph/connections.js`: desenho das conexões.
- `js/storage/storage.js`: salvamento no navegador.
- `js/ui/nodes.js`: blocos, animação, criação e exclusão.
- `js/ui/sidebar.js`: painel de anotações.
- `js/ui/toolbar.js`: botões e conexões manuais.
- `js/app.js`: inicialização e loop principal.

## Observação

As anotações são salvas no `localStorage` do navegador. Portanto, nesta versão os dados ficam no navegador/computador onde o site foi usado.
