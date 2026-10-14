/* ============================================================
   ESTILIZAÇÃO DOS BLOCOS
   (Tipografia, Espaçamento, Forma, Movimento — 4 sub-abas)
   A fonte aqui é a dos BLOCOS; a anotação continua com a
   própria fonte monoespaçada fixa, sem relação com isto.
   ============================================================ */

const NODE_FONT_STACKS = {
  default: "inherit",
  serif:
    'Georgia, "Times New Roman", serif',
  mono:
    'ui-monospace, "Cascadia Code", "Fira Code", Consolas, "Courier New", monospace',
  rounded:
    '"Trebuchet MS", Verdana, sans-serif'
};

const NODE_UPPERCASE_FONT_STACK =
  '"Arial Black", Impact, sans-serif';

function applyNodeStyleVars() {
  const map = currentMap();

  const canvas =
    document.getElementById("canvas");

  const svg =
    document.getElementById(
      "connections"
    );

  if (!canvas || !svg) return;

  const fontSize = map?.fontSize || 14;
  const lineWidth =
    map?.lineThickness || 1.4;
  const nodeWidth =
    map?.nodeWidth || 190;
  const nodeHeight =
    map?.nodeHeight || 82;
  const nodeRadius =
    map?.nodeRadius ?? 0;
  const dimmedOpacity =
    (map?.dimmedOpacity ?? 90) / 100;
  const showCorners =
    map?.showCorners !== false;
  const selectedGlow =
    (map?.selectedGlow ?? 60) / 100;

  const uppercase = !!map?.titleUppercase;

  const fontFamilyKey =
    map?.fontFamily || "default";

  const fontFamilyValue = uppercase
    ? NODE_UPPERCASE_FONT_STACK
    : NODE_FONT_STACKS[fontFamilyKey] ||
      NODE_FONT_STACKS.default;

  const titleWrap = !!map?.titleWrap;

  const maxLines =
    map?.titleMaxLines || 2;

  canvas.style.setProperty(
    "--node-font-size",
    `${fontSize}px`
  );

  canvas.style.setProperty(
    "--node-font-family",
    fontFamilyValue
  );

  canvas.style.setProperty(
    "--title-transform",
    uppercase ? "uppercase" : "none"
  );

  canvas.style.setProperty(
    "--title-white-space",
    titleWrap ? "normal" : "nowrap"
  );

  canvas.style.setProperty(
    "--title-max-lines",
    titleWrap ? maxLines : 1
  );

  canvas.style.setProperty(
    "--node-width",
    `${nodeWidth}px`
  );

  canvas.style.setProperty(
    "--node-height",
    `${nodeHeight}px`
  );

  canvas.style.setProperty(
    "--node-radius",
    `${nodeRadius}px`
  );

  canvas.style.setProperty(
    "--node-dimmed-opacity",
    dimmedOpacity
  );

  canvas.style.setProperty(
    "--corners-opacity",
    showCorners ? "1" : "0"
  );

  canvas.style.setProperty(
    "--node-selected-glow",
    selectedGlow
  );

  svg.style.setProperty(
    "--connection-width",
    lineWidth
  );
}

/* ---------- Tipografia ---------- */

function renderTipografiaTab(map) {
  const fontSelect =
    document.getElementById(
      "fontFamilySelect"
    );

  const uppercaseToggle =
    document.getElementById(
      "titleUppercaseToggle"
    );

  const wrapToggle =
    document.getElementById(
      "titleWrapToggle"
    );

  const maxLinesRow =
    document.getElementById(
      "titleMaxLinesRow"
    );

  const maxLinesSlider =
    document.getElementById(
      "titleMaxLinesSlider"
    );

  [
    fontSelect,
    uppercaseToggle,
    wrapToggle,
    maxLinesSlider
  ].forEach(el => {
    if (el) el.disabled = !map;
  });

  if (!map) return;

  fontSelect.value =
    map.fontFamily || "default";

  uppercaseToggle.checked =
    !!map.titleUppercase;

  wrapToggle.checked =
    !!map.titleWrap;

  maxLinesRow.hidden = !map.titleWrap;

  maxLinesSlider.value =
    map.titleMaxLines || 2;

  document.getElementById(
    "titleMaxLinesValue"
  ).textContent =
    maxLinesSlider.value;
}

function bindTipografiaTab() {
  document
    .getElementById("fontFamilySelect")
    .addEventListener(
      "change",
      event => {
        const map = currentMap();

        if (!map) return;

        map.fontFamily =
          event.target.value;

        applyNodeStyleVars();
        touchMapEdited();
        saveData(false);
      }
    );

  document
    .getElementById(
      "titleUppercaseToggle"
    )
    .addEventListener(
      "change",
      event => {
        const map = currentMap();

        if (!map) return;

        map.titleUppercase =
          event.target.checked;

        applyNodeStyleVars();
        touchMapEdited();
        saveData(false);
      }
    );

  document
    .getElementById("titleWrapToggle")
    .addEventListener(
      "change",
      event => {
        const map = currentMap();

        if (!map) return;

        map.titleWrap =
          event.target.checked;

        document.getElementById(
          "titleMaxLinesRow"
        ).hidden =
          !event.target.checked;

        applyNodeStyleVars();
        touchMapEdited();
        saveData(false);
      }
    );

  bindSlider(
    "fontSizeSlider",
    "fontSize"
  );

  bindSlider(
    "titleMaxLinesSlider",
    "titleMaxLines",
    { integer: true }
  );
}

/* ---------- Genérico: slider ligado a um campo do mapa ---------- */

function bindSlider(
  sliderId,
  field,
  { integer = false } = {}
) {
  const slider =
    document.getElementById(sliderId);

  if (!slider) return;

  slider.addEventListener(
    "input",
    () => {
      const map = currentMap();

      if (!map) return;

      const value = integer
        ? parseInt(slider.value, 10)
        : Number(slider.value);

      map[field] = value;

      const label =
        document.getElementById(
          sliderId.replace(
            "Slider",
            "Value"
          )
        );

      if (label) {
        label.textContent =
          slider.value;
      }

      applyNodeStyleVars();
      touchMapEdited();
      saveData(false);
    }
  );
}

/* ---------- Espaçamento ---------- */

function renderEspacamentoTab(map) {
  const spacingSlider =
    document.getElementById(
      "spacingSlider"
    );

  const lineGapSlider =
    document.getElementById(
      "lineGapSlider"
    );

  [spacingSlider, lineGapSlider].forEach(
    el => {
      if (el) el.disabled = !map;
    }
  );

  if (!map) return;

  spacingSlider.value =
    map.nodeSpacing || 60;

  document.getElementById(
    "spacingValue"
  ).textContent =
    spacingSlider.value;

  lineGapSlider.value =
    map.lineGap ?? 14;

  document.getElementById(
    "lineGapValue"
  ).textContent =
    lineGapSlider.value;
}

function bindEspacamentoTab() {
  bindSlider(
    "spacingSlider",
    "nodeSpacing",
    { integer: true }
  );

  bindSlider(
    "lineGapSlider",
    "lineGap",
    { integer: true }
  );
}

/* ---------- Forma de blocos e linhas ---------- */

function renderFormaTab(map) {
  const sliderIds = [
    "nodeWidthSlider",
    "nodeHeightSlider",
    "nodeRadiusSlider",
    "lineThicknessSlider",
    "dimmedOpacitySlider",
    "selectedGlowSlider"
  ];

  sliderIds.forEach(id => {
    const el =
      document.getElementById(id);

    if (el) el.disabled = !map;
  });

  const cornersToggle =
    document.getElementById(
      "showCornersToggle"
    );

  if (cornersToggle) {
    cornersToggle.disabled = !map;
  }

  if (!map) return;

  const values = {
    nodeWidthSlider:
      map.nodeWidth || 190,
    nodeHeightSlider:
      map.nodeHeight || 82,
    nodeRadiusSlider:
      map.nodeRadius ?? 0,
    lineThicknessSlider:
      map.lineThickness || 1.4,
    dimmedOpacitySlider:
      map.dimmedOpacity ?? 90,
    selectedGlowSlider:
      map.selectedGlow ?? 60
  };

  Object.entries(values).forEach(
    ([id, value]) => {
      const slider =
        document.getElementById(id);

      const label =
        document.getElementById(
          id.replace(
            "Slider",
            "Value"
          )
        );

      if (slider) slider.value = value;
      if (label) {
        label.textContent = value;
      }
    }
  );

  cornersToggle.checked =
    map.showCorners !== false;
}

function bindFormaTab() {
  bindSlider(
    "nodeWidthSlider",
    "nodeWidth",
    { integer: true }
  );

  bindSlider(
    "nodeHeightSlider",
    "nodeHeight",
    { integer: true }
  );

  bindSlider(
    "nodeRadiusSlider",
    "nodeRadius",
    { integer: true }
  );

  bindSlider(
    "lineThicknessSlider",
    "lineThickness"
  );

  bindSlider(
    "dimmedOpacitySlider",
    "dimmedOpacity",
    { integer: true }
  );

  bindSlider(
    "selectedGlowSlider",
    "selectedGlow",
    { integer: true }
  );

  document
    .getElementById("showCornersToggle")
    .addEventListener(
      "change",
      () => {
        const map = currentMap();

        if (!map) return;

        map.showCorners =
          document.getElementById(
            "showCornersToggle"
          ).checked;

        applyNodeStyleVars();
        touchMapEdited();
        saveData(false);
      }
    );
}

/* ---------- Movimento ---------- */

function renderMovimentoTab(map) {
  const enabledToggle =
    document.getElementById(
      "wobbleEnabledToggle"
    );

  const intensitySlider =
    document.getElementById(
      "wobbleIntensitySlider"
    );

  const speedSlider =
    document.getElementById(
      "wobbleSpeedSlider"
    );

  const patternSelect =
    document.getElementById(
      "wobblePatternSelect"
    );

  enabledToggle.disabled = !map;

  if (!map) {
    document.getElementById(
      "wobbleOptions"
    ).hidden = true;
    return;
  }

  const enabled =
    map.wobbleEnabled !== false;

  enabledToggle.checked = enabled;

  document.getElementById(
    "wobbleOptions"
  ).hidden = !enabled;

  intensitySlider.value =
    map.wobbleIntensity ?? 100;

  document.getElementById(
    "wobbleIntensityValue"
  ).textContent =
    intensitySlider.value;

  speedSlider.value =
    map.wobbleSpeed ?? 100;

  document.getElementById(
    "wobbleSpeedValue"
  ).textContent =
    speedSlider.value;

  patternSelect.value =
    map.wobblePattern || "circular";
}

function bindMovimentoTab() {
  document
    .getElementById(
      "wobbleEnabledToggle"
    )
    .addEventListener(
      "change",
      event => {
        const map = currentMap();

        if (!map) return;

        map.wobbleEnabled =
          event.target.checked;

        document.getElementById(
          "wobbleOptions"
        ).hidden =
          !event.target.checked;

        touchMapEdited();
        saveData(false);
      }
    );

  bindSlider(
    "wobbleIntensitySlider",
    "wobbleIntensity",
    { integer: true }
  );

  bindSlider(
    "wobbleSpeedSlider",
    "wobbleSpeed",
    { integer: true }
  );

  document
    .getElementById(
      "wobblePatternSelect"
    )
    .addEventListener(
      "change",
      event => {
        const map = currentMap();

        if (!map) return;

        map.wobblePattern =
          event.target.value;

        touchMapEdited();
        saveData(false);
      }
    );
}

/* ---------- Ponto de entrada da aba (4 sub-abas) ---------- */

function renderNodesTab() {
  const map = currentMap();

  renderTipografiaTab(map);
  renderEspacamentoTab(map);
  renderFormaTab(map);
  renderMovimentoTab(map);
}

function bindNodeStyleSliders() {
  bindTipografiaTab();
  bindEspacamentoTab();
  bindFormaTab();
  bindMovimentoTab();
}
