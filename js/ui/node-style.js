/* ============================================================
   TIPOGRAFIA E ESPAÇAMENTO DOS BLOCOS
   ============================================================ */

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
  const nodeRadius =
    map?.nodeRadius ?? 0;
  const dimmedOpacity =
    (map?.dimmedOpacity ?? 90) / 100;
  const showCorners =
    map?.showCorners !== false;

  canvas.style.setProperty(
    "--node-font-size",
    `${fontSize}px`
  );

  canvas.style.setProperty(
    "--node-width",
    `${nodeWidth}px`
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

  svg.style.setProperty(
    "--connection-width",
    lineWidth
  );
}

function renderNodesTab() {
  const map = currentMap();

  const sliderIds = [
    "fontSizeSlider",
    "lineThicknessSlider",
    "spacingSlider",
    "nodeWidthSlider",
    "nodeRadiusSlider",
    "dimmedOpacitySlider"
  ];

  const disabled = !map;

  sliderIds.forEach(id => {
    const el =
      document.getElementById(id);

    if (el) el.disabled = disabled;
  });

  const cornersToggle =
    document.getElementById(
      "showCornersToggle"
    );

  if (cornersToggle) {
    cornersToggle.disabled = disabled;
  }

  if (!map) return;

  const values = {
    fontSizeSlider: map.fontSize || 14,
    lineThicknessSlider:
      map.lineThickness || 1.4,
    spacingSlider:
      map.nodeSpacing || 60,
    nodeWidthSlider:
      map.nodeWidth || 190,
    nodeRadiusSlider:
      map.nodeRadius ?? 0,
    dimmedOpacitySlider:
      map.dimmedOpacity ?? 90
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

  if (cornersToggle) {
    cornersToggle.checked =
      map.showCorners !== false;
  }
}

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

function bindNodeStyleSliders() {
  bindSlider(
    "fontSizeSlider",
    "fontSize"
  );

  bindSlider(
    "lineThicknessSlider",
    "lineThickness"
  );

  bindSlider(
    "spacingSlider",
    "nodeSpacing",
    { integer: true }
  );

  bindSlider(
    "nodeWidthSlider",
    "nodeWidth",
    { integer: true }
  );

  bindSlider(
    "nodeRadiusSlider",
    "nodeRadius",
    { integer: true }
  );

  bindSlider(
    "dimmedOpacitySlider",
    "dimmedOpacity",
    { integer: true }
  );

  const cornersToggle =
    document.getElementById(
      "showCornersToggle"
    );

  if (cornersToggle) {
    cornersToggle.addEventListener(
      "change",
      () => {
        const map = currentMap();

        if (!map) return;

        map.showCorners =
          cornersToggle.checked;

        applyNodeStyleVars();
        touchMapEdited();
        saveData(false);
      }
    );
  }
}
