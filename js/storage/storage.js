/* ============================================================
   STORAGE
   ============================================================ */

const STORAGE_KEY = "mapa-anotacoes-v4";

function saveData(show = true) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      maps: AppState.maps,
      currentMapId: AppState.currentMapId
    })
  );

  if (show) {
    showStatus("Salvo");
  }
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) {
      const data = JSON.parse(raw);

      if (
        data &&
        Array.isArray(data.maps)
      ) {
        AppState.maps = data.maps;
        AppState.currentMapId =
          data.currentMapId ||
          data.maps[0]?.id ||
          null;

        return;
      }
    }
  } catch (error) {
    console.warn(
      "Erro ao carregar dados:",
      error
    );
  }

  /*
    PRIMEIRA ABERTURA:
    completamente vazia.
    Nenhum mapa e nenhum bloco prontos.
  */
  AppState.maps = [];
  AppState.currentMapId = null;
}

function showStatus(message) {
  const element =
    document.getElementById("status");

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(showStatus.timer);

  showStatus.timer = setTimeout(() => {
    element.classList.remove("show");
  }, 900);
}
