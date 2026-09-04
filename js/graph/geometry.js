/* ============================================================
   GEOMETRIA
   ============================================================ */

function centerOf(element) {
  const rect = element.getBoundingClientRect();
  const boardRect =
    document.getElementById("board")
      .getBoundingClientRect();

  return {
    x: rect.left - boardRect.left + rect.width / 2,
    y: rect.top - boardRect.top + rect.height / 2,
    w: rect.width,
    h: rect.height
  };
}

/*
  A linha termina ANTES da borda.
  O inset é o espaço vazio entre a ponta e a parede do bloco.
*/
function edgePoint(from, to, inset = 14) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (
    Math.abs(dx) < .001 &&
    Math.abs(dy) < .001
  ) {
    return {
      x: from.x,
      y: from.y
    };
  }

  const tx =
    Math.abs(dx) < .001
      ? Infinity
      : (from.w / 2) / Math.abs(dx);

  const ty =
    Math.abs(dy) < .001
      ? Infinity
      : (from.h / 2) / Math.abs(dy);

  const t = Math.min(tx, ty);

  const edgeX = from.x + dx * t;
  const edgeY = from.y + dy * t;

  const length = Math.hypot(dx, dy);

  return {
    x: edgeX + (dx / length) * inset,
    y: edgeY + (dy / length) * inset
  };
}

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}
