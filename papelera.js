/* Papelera de clientes eliminados (Cobranzas, VEP Monotributo, VEP Autónomos e Informe Mensual).
   - Antes de eliminar un cliente, la herramienta llama a zvPapelera.enviar(...) con las rutas de la
     nube que se van a borrar. Se guarda una copia de todo lo que hay en esas rutas en
     papelera/<herramienta>/<id>. Si la copia no se pudo guardar, la herramienta no elimina nada.
   - El botón "Papelera" (al lado de "+ Agregar cliente") muestra los clientes eliminados.
     "Restaurar" vuelve a escribir cada dato en su lugar, en una sola operación, y lo quita de la papelera.
     Las herramientas ven la restauración por sus listeners de siempre, en todas las computadoras.
   - A los 30 días, la copia se borra sola la próxima vez que alguien abre la herramienta. */
(function () {
  const DIAS = 30;
  const DIA_MS = 24 * 60 * 60 * 1000;

  let cfg = null;
  let entradas = [];   // [{id, cliente, nombre, eliminado, datos: [{ruta, valor}]}], la más reciente primero
  let abierta = false;
  let boton = null;
  let panel = null;

  const base = () => "papelera/" + cfg.herramienta;
  const ruta = r => (cfg.prefijo ? cfg.prefijo + "/" : "") + r;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const dos = n => String(n).padStart(2, "0");
  const fecha = ms => { const f = new Date(ms); return `${dos(f.getDate())}/${dos(f.getMonth() + 1)}/${f.getFullYear()} a las ${dos(f.getHours())}:${dos(f.getMinutes())} h`; };

  function conTiempoLimite(promesa, ms) {
    return Promise.race([promesa, new Promise((_, rechazar) => setTimeout(() => rechazar(new Error("Sin respuesta de la nube")), ms))]);
  }

  function diasRestantes(e) {
    return Math.max(0, Math.ceil((e.eliminado + DIAS * DIA_MS - Date.now()) / DIA_MS));
  }

  function render() {
    if (!boton) return;
    boton.style.display = entradas.length ? "" : "none";
    boton.textContent = "Papelera (" + entradas.length + ")";
    boton.classList.toggle("active", abierta);
    if (!abierta || !entradas.length) { abierta = false; panel.innerHTML = ""; return; }
    panel.innerHTML = `
      <div class="panel papelera">
        <h3>Papelera</h3>
        <p class="hint">Los clientes eliminados quedan acá ${DIAS} días, con todos sus datos cargados en esta herramienta. Después se borran solos.</p>
        <ul class="papelera-lista">
          ${entradas.map(e => {
            const dias = diasRestantes(e);
            return `<li>
              <div class="papelera-info">
                <strong>${esc(e.nombre || e.cliente)}</strong>
                <span>Eliminado el ${esc(fecha(e.eliminado))} · ${dias <= 1 ? "se borra en menos de un día" : "se borra en " + dias + " días"}</span>
              </div>
              <button class="btn" type="button" data-restaurar="${esc(e.id)}">Restaurar</button>
            </li>`;
          }).join("")}
        </ul>
      </div>`;
  }

  function recibir(val) {
    const limite = Date.now() - DIAS * DIA_MS;
    const vigentes = [];
    Object.keys(val || {}).forEach(id => {
      const e = val[id];
      if (!e || !e.cliente) return;
      if (!(Number(e.eliminado) > limite)) {
        // Venció el plazo: se borra definitivamente.
        cfg.db.ref(base() + "/" + id).remove().catch(() => {});
        return;
      }
      const lista = v => Array.isArray(v) ? v : Object.values(v || {});
      vigentes.push({ id, cliente: e.cliente, nombre: e.nombre, eliminado: Number(e.eliminado), datos: lista(e.datos), borrarAlRestaurar: lista(e.borrarAlRestaurar) });
    });
    entradas = vigentes.sort((a, b) => b.eliminado - a.eliminado);
    render();
  }

  async function restaurar(id, btn) {
    const e = entradas.find(x => x.id === id);
    if (!e) return;
    if (cfg.existeCliente(e.cliente, e)) {
      cfg.toast(`Ya hay un cliente llamado ${e.nombre || e.cliente}. Para restaurar este, primero cambiale el nombre al otro o eliminalo.`, true);
      return;
    }
    const cambios = {};
    e.borrarAlRestaurar.forEach(r => { if (r) cambios[r] = null; });
    e.datos.forEach(d => { if (d && d.ruta) cambios[d.ruta] = d.valor; });
    cambios[base() + "/" + id] = null;
    btn.disabled = true;
    try {
      await conTiempoLimite(cfg.db.ref().update(cambios), 20000);
      cfg.toast(`${e.nombre || e.cliente} volvió a la lista, con todos sus datos`);
    } catch (err) {
      btn.disabled = false;
      cfg.toast("No se pudo restaurar. Revisá la conexión e intentá de nuevo.", true);
    }
  }

  window.zvPapelera = {
    // Se llama cuando ya hay sesión iniciada (junto con los listeners de la nube de la herramienta).
    //   db: firebase.database(); herramienta: nombre de la carpeta en papelera/;
    //   prefijo: carpeta de la herramienta en la nube ("" si usa la raíz);
    //   existeCliente(cliente, entrada): true si ya hay un cliente que choca con el de la papelera;
    //   toast(mensaje, esError); opcionales: botonJunto y panelDespuesDe, los id del botón
    //   "+ Agregar cliente" y de su formulario (por defecto "toggleAdd" y "addFormWrap").
    iniciar(opciones) {
      if (cfg) return;
      cfg = opciones;
      const agregar = document.getElementById(cfg.botonJunto || "toggleAdd");
      const formulario = document.getElementById(cfg.panelDespuesDe || "addFormWrap");
      if (agregar && formulario) {
        boton = document.createElement("button");
        boton.className = "btn";
        boton.type = "button";
        boton.style.display = "none";
        agregar.insertAdjacentElement("afterend", boton);
        panel = document.createElement("div");
        panel.id = "papeleraWrap";
        formulario.insertAdjacentElement("afterend", panel);
        boton.addEventListener("click", () => { abierta = !abierta; render(); });
        panel.addEventListener("click", ev => {
          const b = ev.target.closest("[data-restaurar]");
          if (b) restaurar(b.dataset.restaurar, b);
        });
      }
      cfg.db.ref(base()).on("value", snap => recibir(snap.val()));
    },

    // Guarda en la papelera una copia de lo que hay en la nube en cada ruta (relativa a la
    // carpeta de la herramienta). Devuelve una promesa que falla si no se pudo guardar.
    // borrarAlRestaurar: rutas que se borran al restaurar (p. ej. la marca de cliente de la lista
    // inicial eliminado, que la herramienta escribe después de guardar la copia).
    async enviar({ cliente, nombre, rutas, borrarAlRestaurar }) {
      if (!cfg) throw new Error("Papelera no iniciada");
      const completas = [...new Set(rutas.map(ruta))];
      const fotos = await conTiempoLimite(Promise.all(completas.map(r => cfg.db.ref(r).get())), 20000);
      const datos = [];
      fotos.forEach((s, i) => { if (s.exists()) datos.push({ ruta: completas[i], valor: s.val() }); });
      const entrada = { cliente, nombre: nombre || cliente, eliminado: Date.now(), datos };
      if (borrarAlRestaurar && borrarAlRestaurar.length) entrada.borrarAlRestaurar = borrarAlRestaurar.map(ruta);
      const ref = cfg.db.ref(base()).push();
      await conTiempoLimite(ref.set(entrada), 20000);
    }
  };
})();
