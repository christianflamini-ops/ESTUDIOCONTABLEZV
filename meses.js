/* Barra de meses: que el mes elegido quede siempre a la vista.
   En pantallas angostas (celular) la barra muestra solo algunos meses y se desliza;
   cada vez que la herramienta la vuelve a dibujar, se la desliza hasta el mes activo
   (solo si no se ve), sin mover el resto de la página. */
(function () {
  const barra = document.getElementById("monthTabs");
  if (!barra) return;

  // El contenedor que se desliza puede ser la barra o algún contenedor cercano.
  function contenedorDeslizable() {
    for (let el = barra; el && el !== document.body; el = el.parentElement) {
      if (el.scrollWidth > el.clientWidth + 1) return el;
    }
    return null;
  }

  function mostrarActivo() {
    const activo = barra.querySelector(".active");
    const cont = contenedorDeslizable();
    if (!activo || !cont) return;
    const a = activo.getBoundingClientRect(), c = cont.getBoundingClientRect();
    if (a.left >= c.left && a.right <= c.right) return; // ya se ve
    cont.scrollLeft += (a.left - c.left) - (c.width - a.width) / 2;
  }

  let pendiente = false;
  new MutationObserver(() => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => { pendiente = false; mostrarActivo(); });
  }).observe(barra, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  window.addEventListener("resize", mostrarActivo);
  mostrarActivo();
})();
