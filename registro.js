/* Registro de cambios: quién hizo qué, en qué herramienta y cuándo.
   - Como todo el equipo entra con la misma cuenta, cada computadora pide una sola vez el nombre de
     quien la usa (se guarda en este navegador, en zv_nombre_usuario). Se puede cambiar tocando el
     nombre, arriba a la derecha, al lado del correo.
   - Las herramientas llaman a zvRegistro.anotar(accion, cliente, detalle) en los cambios importantes
     (cargar importes, marcar enviados, agregar, eliminar o restaurar clientes, importar Excel…).
     Cada anotación va a registro/<id> en la nube; el portal muestra la lista y borra las de más de 90 días.
   - Los nombres ya usados quedan en registroNombres, para sugerirlos y que no se escriban de dos formas. */
(function () {
  const CLAVE = "zv_nombre_usuario";
  const pagina = window.zvPagina || "Portal";
  const pendientes = [];
  let reintento = null;
  let boton = null;
  let nombresConocidos = [];

  const leerNombre = () => { try { return (localStorage.getItem(CLAVE) || "").trim(); } catch (e) { return ""; } };
  const guardarNombre = n => { try { localStorage.setItem(CLAVE, n); } catch (e) {} };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

  function conSesion() {
    try {
      return typeof firebase !== "undefined" && firebase.apps.length && typeof firebase.auth === "function" &&
        typeof firebase.database === "function" && !!firebase.auth().currentUser;
    } catch (e) { return false; }
  }

  function subir() {
    clearTimeout(reintento);
    if (!conSesion()) { reintento = setTimeout(subir, 5000); return; }
    const db = firebase.database();
    while (pendientes.length) db.ref("registro").push(pendientes.shift()).catch(() => {});
  }

  // --- Nombre de quien usa la computadora ---
  function pintarBoton() {
    if (!boton) return;
    const n = leerNombre();
    boton.textContent = n || "¿Quién sos?";
    boton.title = n ? "Quien usa esta computadora (tocá para cambiarlo)" : "Indicá quién usa esta computadora";
  }

  function pedirNombre(obligatorio) {
    if (document.getElementById("zvQuien")) return;
    const actual = leerNombre();
    const fondo = document.createElement("div");
    fondo.className = "zv-modal-fondo";
    fondo.id = "zvQuien";
    fondo.innerHTML = `
      <form class="zv-modal" autocomplete="off">
        <h3>¿Quién está usando esta computadora?</h3>
        <p>Tu nombre queda en el registro de cambios del portal, para saber quién marcó un envío, cargó un importe o eliminó un cliente. Se guarda solo en esta computadora; si la comparten, cambialo tocando tu nombre arriba a la derecha.</p>
        <input id="zvQuienNombre" list="zvQuienLista" maxlength="40" placeholder="Ej: María" value="${esc(actual)}">
        <datalist id="zvQuienLista">${nombresConocidos.map(n => `<option value="${esc(n)}">`).join("")}</datalist>
        <div class="zv-modal-acciones">
          ${obligatorio ? "" : '<button type="button" class="btn" data-cancelar>Cancelar</button>'}
          <button type="submit" class="btn primary">Guardar</button>
        </div>
      </form>`;
    document.body.appendChild(fondo);
    const input = fondo.querySelector("input");
    setTimeout(() => input.focus(), 50);
    const cerrar = () => fondo.remove();
    const cancelar = fondo.querySelector("[data-cancelar]");
    if (cancelar) cancelar.addEventListener("click", cerrar);
    fondo.querySelector("form").addEventListener("submit", ev => {
      ev.preventDefault();
      const n = input.value.replace(/\s+/g, " ").trim();
      if (!n) { input.focus(); return; }
      guardarNombre(n);
      if (conSesion()) firebase.database().ref("registroNombres/" + n.toLowerCase().replace(/[.#$\[\]\/]/g, "_")).set(n).catch(() => {});
      pintarBoton();
      cerrar();
    });
  }

  function prepararPantalla() {
    if (!conSesion()) { setTimeout(prepararPantalla, 1500); return; }
    const correo = document.getElementById("userEmailTop") || document.getElementById("userEmail");
    if (correo && !boton) {
      boton = document.createElement("button");
      boton.type = "button";
      boton.className = "quien-btn";
      correo.insertAdjacentElement("beforebegin", boton);
      boton.addEventListener("click", () => pedirNombre(false));
      pintarBoton();
    }
    firebase.database().ref("registroNombres").get()
      .then(s => { nombresConocidos = Object.values(s.val() || {}).sort((a, b) => a.localeCompare(b, "es")); })
      .catch(() => {})
      .then(() => { if (!leerNombre()) pedirNombre(true); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", prepararPantalla);
  else prepararPantalla();

  window.zvRegistro = {
    // accion: qué se hizo ("Marcó como Enviado"); cliente: a quién (opcional); detalle: datos extra (opcional).
    anotar(accion, cliente, detalle) {
      try {
        pendientes.push({
          fecha: Date.now(), quien: leerNombre() || "Sin nombre", herramienta: pagina,
          accion: String(accion || "").slice(0, 200), cliente: String(cliente || "").slice(0, 200), detalle: String(detalle || "").slice(0, 300)
        });
        subir();
      } catch (e) {}
    },
    nombre: leerNombre
  };
})();
