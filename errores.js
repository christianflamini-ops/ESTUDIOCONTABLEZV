/* Registro de errores del portal y las herramientas.
   - Anota en la nube (errores/<id>) los errores de JavaScript que no se atraparon, las promesas
     rechazadas sin atender y los console.error, para que el portal avise "Hubo N errores esta semana".
   - Se carga antes del código de cada página, así que también ve los errores del arranque. Los guarda
     en memoria y los sube cuando ya hay sesión iniciada (las reglas de la base exigen el ingreso).
   - Para no llenar la base: el mismo error se anota una sola vez por página abierta, y como máximo
     MAX_POR_PAGINA errores por página abierta. El portal borra los que tienen más de 30 días. */
(function () {
  const MAX_POR_PAGINA = 15;
  const PAGINAS = {
    "": "Portal", "gestion-de-cobranzas": "Gestión de Cobranzas", "vep-monotributo": "VEP Monotributo",
    "vep-autonomos": "VEP Autónomos", "informe-monotributo": "Informe Mensual", "consulta-cuits": "Consulta de CUITs"
  };
  const ruta = (() => { try { return new URL(document.baseURI).pathname; } catch (e) { return location.pathname; } })();
  const carpeta = (ruta.match(/\/([^\/]+)\/(?:index\.html)?$/) || [])[1] || "";
  const pagina = PAGINAS[carpeta] || "Portal";
  window.zvPagina = pagina; // nombre de esta página; lo usa también registro.js

  const pendientes = [];
  const vistos = new Set();
  let anotados = 0;
  let reintento = null;

  function navegador() {
    const ua = navigator.userAgent;
    const n = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Otro";
    const so = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iPhone/iPad" : /Mac OS/.test(ua) ? "Mac" : "otro sistema";
    return n + " en " + so;
  }

  function texto(x) {
    if (x instanceof Error) return x.message || String(x);
    if (typeof x === "string") return x;
    try { return JSON.stringify(x); } catch (e) { return String(x); }
  }

  function anotar(mensaje, detalle) {
    mensaje = String(mensaje || "Error sin descripción").slice(0, 500);
    // "Script error." llega de scripts de otros sitios y no trae información útil.
    if (/^Script error\.?$/.test(mensaje)) return;
    const clave = mensaje + "|" + (detalle || "");
    if (vistos.has(clave) || anotados >= MAX_POR_PAGINA) return;
    vistos.add(clave);
    anotados++;
    pendientes.push({
      pagina, mensaje, detalle: String(detalle || "").slice(0, 1500),
      fecha: Date.now(), navegador: navegador(),
      quien: (function () { try { return localStorage.getItem("zv_nombre_usuario") || ""; } catch (e) { return ""; } })()
    });
    subir();
  }

  function subir() {
    clearTimeout(reintento);
    try {
      if (typeof firebase === "undefined" || !firebase.apps.length || typeof firebase.database !== "function" ||
          typeof firebase.auth !== "function" || !firebase.auth().currentUser) {
        reintento = setTimeout(subir, 5000);
        return;
      }
      const db = firebase.database();
      while (pendientes.length) db.ref("errores").push(pendientes.shift()).catch(() => {});
    } catch (e) {
      reintento = setTimeout(subir, 5000);
    }
  }

  window.addEventListener("error", ev => {
    const lugar = ev.filename ? `${ev.filename.split("/").slice(-2).join("/")}:${ev.lineno}:${ev.colno}` : "";
    anotar(ev.message || texto(ev.error), [lugar, ev.error && ev.error.stack].filter(Boolean).join("\n"));
  });
  window.addEventListener("unhandledrejection", ev => {
    const r = ev.reason;
    anotar("Promesa sin atender: " + texto(r), r && r.stack);
  });
  const errorOriginal = console.error;
  console.error = function (...args) {
    try { anotar(args.map(texto).join(" "), (args.find(a => a instanceof Error) || {}).stack); } catch (e) {}
    return errorOriginal.apply(this, args);
  };

  // Para anotar a mano un error atrapado: zvAnotarError("No se pudo …", detalle).
  window.zvAnotarError = anotar;
})();
