/* ============================================================
   TOOLBAR
   ============================================================ */

document
  .getElementById("addChildBtn")
  .addEventListener(
    "click",
    createChild
  );

document
  .getElementById("deleteBtn")
  .addEventListener(
    "click",
    deleteSelectedNode
);
