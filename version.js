/* Aviso de versión nueva del sitio.
   Cada página tiene grabado su número de versión (<meta name="zv-version">). Al abrirse, cada
   5 minutos y al volver a la pestaña, lo compara con version.json, que siempre tiene la versión
   publicada. Si son distintos, muestra abajo un aviso para cargar la versión nueva sin Ctrl+F5.
   El número se actualiza en todas las páginas con actualizar-version.sh antes de publicar. */
(function () {
  const meta = document.querySelector('meta[name="zv-version"]');
  const actual = meta && meta.content;
  if (!actual) return;
  // version.json está en la raíz del sitio, junto a este archivo.
  const base = (document.currentScript && document.currentScript.src) || location.href;
  const urlVersion = new URL("version.json", base).href;
  const CADA_MS = 5 * 60 * 1000;
  let aviso = null;
  let ultimaRevision = 0;

  function mostrarAviso(nueva) {
    if (aviso) return;
    aviso = document.createElement("div");
    aviso.className = "aviso-version";
    aviso.setAttribute("role", "status");
    aviso.innerHTML = '<span>Hay una versión nueva del sitio. Guardá lo que estés haciendo y actualizá.</span>' +
      '<button type="button" class="btn primary">Actualizar</button>';
    aviso.querySelector("button").addEventListener("click", () => {
      // Se agrega la versión a la dirección para que el navegador no use la copia guardada.
      const u = new URL(location.href);
      u.searchParams.set("v", nueva);
      location.replace(u.href);
    });
    document.body.appendChild(aviso);
  }

  async function revisar() {
    if (aviso || Date.now() - ultimaRevision < 30 * 1000) return;
    ultimaRevision = Date.now();
    try {
      const r = await fetch(urlVersion + "?t=" + Date.now(), { cache: "no-store" });
      if (!r.ok) return;
      const { version } = await r.json();
      if (version && version !== actual) mostrarAviso(version);
    } catch (e) { /* sin conexión: se vuelve a intentar más tarde */ }
  }

  revisar();
  setInterval(revisar, CADA_MS);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) revisar(); });
})();
