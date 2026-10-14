/* ============================================================
   ABAS DO PAINEL ESQUERDO (E SUB-ABAS)
   ============================================================ */

const PANEL_TABS = [
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

/*
  Sub-abas: cada .panel-view pode ter sua própria barrinha
  (.sub-tabs) com vários (.sub-view). Funciona igual pra
  qualquer seção, sem precisar de código específico por aba.
*/
function switchSubTab(panelView, subtab) {
  panelView
    .querySelectorAll(".sub-tab")
    .forEach(btn => {
      btn.classList.toggle(
        "active",
        btn.dataset.subtab === subtab
      );
    });

  panelView
    .querySelectorAll(".sub-view")
    .forEach(view => {
      const key =
        view.dataset.subview.split(
          ":"
        )[1];

      view.classList.toggle(
        "active",
        key === subtab
      );
    });
}

function bindSubTabs() {
  document
    .querySelectorAll(".sub-tab")
    .forEach(btn => {
      btn.addEventListener(
        "click",
        () => {
          const panelView =
            btn.closest(
              ".panel-view"
            );

          if (panelView) {
            switchSubTab(
              panelView,
              btn.dataset.subtab
            );
          }
        }
      );
    });
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

  bindSubTabs();
}
