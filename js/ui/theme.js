/* ============================================================
   TEMA
   Estilo visual da página inteira. Diferente do zoom/layout,
   o tema não pertence a um mapa — é uma preferência geral,
   guardada separadamente.
   ============================================================ */

const THEMES = [
  {
    key: "dark-modern",
    name: "Dark Modern",
    desc: "Padrão atual da página",
    group: "escuro"
  },
  {
    key: "dracula",
    name: "Dracula",
    desc: "Roxo e rosa, estilo VSCode",
    group: "escuro"
  },
  {
    key: "ultron",
    name: "Ultron",
    desc: "Cinza escuro com vermelho",
    group: "escuro"
  },
  {
    key: "jarvis",
    name: "Jarvis",
    desc: "HUD ciano, estilo Homem de Ferro",
    group: "escuro"
  },
  {
    key: "light-modern",
    name: "Light Modern",
    desc: "Cinza claro, conforto visual",
    group: "claro"
  },
  {
    key: "creme",
    name: "Creme com Marrom",
    desc: "Creme aconchegante e marrom",
    group: "claro"
  }
];

const THEME_STORAGE_KEY = "mapa-tema";
const DEFAULT_THEME = "dark-modern";

function applyTheme(key) {
  document.documentElement.dataset.theme = key;

  localStorage.setItem(
    THEME_STORAGE_KEY,
    key
  );

  renderThemeTab();
}

function loadTheme() {
  const saved =
    localStorage.getItem(
      THEME_STORAGE_KEY
    );

  const valid =
    saved &&
    THEMES.some(
      theme => theme.key === saved
    );

  document.documentElement.dataset.theme =
    valid ? saved : DEFAULT_THEME;
}

function renderThemeGroup(
  container,
  label,
  groupKey,
  current
) {
  const heading =
    document.createElement("div");

  heading.className = "panel-subtitle";
  heading.textContent = label;

  container.appendChild(heading);

  const wrap =
    document.createElement("div");

  wrap.className = "theme-group";

  THEMES.filter(
    theme => theme.group === groupKey
  ).forEach(theme => {
    const row =
      document.createElement("button");

    row.type = "button";
    row.className =
      "theme-item" +
      (theme.key === current
        ? " active"
        : "");

    row.innerHTML = `
      <span class="theme-swatch swatch-${theme.key}"></span>
      <span class="theme-info">
        <span class="theme-name">${theme.name}</span>
        <span class="theme-desc">${theme.desc}</span>
      </span>
      ${
        theme.key === current
          ? '<span class="theme-check">✓</span>'
          : ""
      }
    `;

    row.addEventListener(
      "click",
      () => applyTheme(theme.key)
    );

    wrap.appendChild(row);
  });

  container.appendChild(wrap);
}

function renderThemeTab() {
  const list =
    document.getElementById("themeList");

  if (!list) return;

  const current =
    document.documentElement.dataset
      .theme || DEFAULT_THEME;

  list.innerHTML = "";

  renderThemeGroup(
    list,
    "TEMA ESCURO",
    "escuro",
    current
  );

  renderThemeGroup(
    list,
    "TEMA CLARO",
    "claro",
    current
  );
}
