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
  .getElementById("exportBlockBtn")
  .addEventListener(
    "click",
    exportSelectedBlock
  );

document
  .getElementById("importBlockBtn")
  .addEventListener(
    "click",
    importBlock
  );

document
  .getElementById("deleteBtn")
  .addEventListener(
    "click",
    deleteSelectedNode
);
