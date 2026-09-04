/* ============================================================
   ABAS DO PAINEL ESQUERDO
   ============================================================ */

const PANEL_TABS = [
  "mapas",
  "tema",
  "layout",
  "nos",
  "atalhos"
];

function switchPanelTab(tab) {
  if (!PANEL_TABS.includes(tab)) {
    return;
  }

  PANEL_TABS.forEach(key => {
    const view =
      document.querySelector(
        `.panel-view[data-view="${key}"]`
      );

    const btn =
      document.querySelector(
        `.panel-tab[data-tab="${key}"]`
      );

    if (view) view.hidden = key !== tab;

    if (btn) {
      btn.classList.toggle(
        "active",
        key === tab
      );
    }
  });

  if (tab === "tema") renderThemeTab();
  if (tab === "layout") renderLayoutTab();
  if (tab === "nos") renderNodesTab();
  if (tab === "atalhos") renderShortcutsTab();
}

function bindPanelTabs() {
  document
    .querySelectorAll(".panel-tab")
    .forEach(btn => {
      btn.addEventListener(
        "click",
        () =>
          switchPanelTab(
            btn.dataset.tab
          )
      );
    });

  document
    .getElementById("panelHelpBtn")
    .addEventListener(
      "click",
      showUpdateLog
    );
}
