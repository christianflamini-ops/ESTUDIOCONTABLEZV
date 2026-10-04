/* Sesión del portal y de todas las herramientas.
   - Duración fija: la sesión se cierra a las 2 horas de haber ingresado, se esté usando o no.
     La hora de ingreso se guarda en el navegador y la comparten todas las páginas del sitio,
     así que pasar de una herramienta a otra no reinicia el plazo.
   - Un solo lugar para ingresar: en una herramienta, si no hay sesión (se cerró con el botón,
     venció el plazo o se abrió la herramienta sin haber ingresado) se vuelve al ingreso del portal.
     Si la herramienta se abrió sin sesión o venció el plazo, después de ingresar se vuelve a ella. */
(function () {
  const DURACION_SESION_MS = 120 * 60 * 1000;
  const CLAVE = "zv_sesion_inicio";
  const AVISO = "zv_aviso_ingreso";   // mensaje para mostrar en el ingreso del portal
  const VOLVER = "zv_volver_a";       // herramienta a la que volver después de ingresar
  const MENSAJE = "La sesión se cerró automáticamente a las 2 horas. Volvé a ingresar.";

  if (typeof firebase === "undefined" || !firebase.apps.length || typeof firebase.auth !== "function") return;

  // Las herramientas tienen el botón "Volver al portal"; el portal no.
  const enlacePortal = document.querySelector("a.back-portal");
  const EN_HERRAMIENTA = !!enlacePortal;

  const guardar = (almacen, clave, valor) => { try { almacen.setItem(clave, valor); } catch (e) {} };
  const leer = (almacen, clave) => { try { return almacen.getItem(clave); } catch (e) { return null; } };
  const borrar = (almacen, clave) => { try { almacen.removeItem(clave); } catch (e) {} };

  const leerInicio = () => Number(leer(localStorage, CLAVE)) || 0;
  const guardarInicio = ms => guardar(localStorage, CLAVE, String(ms));
  const borrarInicio = () => borrar(localStorage, CLAVE);

  let inicioEnMemoria = 0;
  let timer = null;
  let vigilancia = null;
  let cerradaPorTiempo = false;
  let primerAviso = true;
  let esperaSinSesion = null;

  function cerrar() {
    cerradaPorTiempo = true;
    clearTimeout(timer);
    clearInterval(vigilancia);
    borrarInicio();
    firebase.auth().signOut();
  }

  function revisar() {
    const inicio = leerInicio() || inicioEnMemoria;
    if (inicio && Date.now() - inicio >= DURACION_SESION_MS) cerrar();
  }

  // Volver al ingreso del portal. Si se pide, después de ingresar se vuelve a esta herramienta.
  function irAlPortal(volverDespues) {
    if (cerradaPorTiempo) guardar(sessionStorage, AVISO, MENSAJE);
    if (volverDespues) guardar(sessionStorage, VOLVER, location.href);
    else borrar(sessionStorage, VOLVER);
    location.replace(enlacePortal.href);
  }

  function sinSesion(alAbrir) {
    clearTimeout(timer);
    clearInterval(vigilancia);
    borrarInicio();
    inicioEnMemoria = 0;
    if (EN_HERRAMIENTA) {
      // Al abrir sin sesión o por vencimiento: volver a la herramienta después de ingresar.
      // Con el botón "Cerrar sesión": quedarse en el portal.
      irAlPortal(alAbrir || cerradaPorTiempo);
      return;
    }
    if (cerradaPorTiempo) {
      cerradaPorTiempo = false;
      setTimeout(() => {
        const err = document.getElementById("loginError");
        if (err) err.textContent = MENSAJE;
      }, 50);
    }
  }

  firebase.auth().onAuthStateChanged(user => {
    const esPrimero = primerAviso;
    primerAviso = false;
    clearTimeout(esperaSinSesion);
    clearTimeout(timer);
    clearInterval(vigilancia);
    if (user) {
      // En el portal, después de ingresar: volver a la herramienta pendiente, si la hay.
      if (!EN_HERRAMIENTA) {
        const volver = leer(sessionStorage, VOLVER);
        borrar(sessionStorage, VOLVER);
        if (volver) {
          try {
            if (new URL(volver).origin === location.origin) { location.replace(volver); return; }
          } catch (e) {}
        }
      }
      let inicio = leerInicio();
      if (!inicio) { inicio = Date.now(); guardarInicio(inicio); }
      inicioEnMemoria = inicio;
      const restante = inicio + DURACION_SESION_MS - Date.now();
      if (restante <= 0) { cerrar(); return; }
      timer = setTimeout(cerrar, restante);
      // Por si la computadora se suspende y el temporizador se atrasa.
      vigilancia = setInterval(revisar, 30 * 1000);
    } else if (esPrimero) {
      // Al abrir la página, Firebase puede avisar "sin sesión" un instante antes de recuperar
      // la sesión guardada: se espera un poco antes de darla por cerrada.
      esperaSinSesion = setTimeout(() => { if (!firebase.auth().currentUser) sinSesion(true); }, 1500);
    } else {
      sinSesion(false);
    }
  });

  // En el ingreso del portal: mostrar el aviso que dejó una herramienta (por ejemplo, vencimiento).
  if (!EN_HERRAMIENTA) {
    const aviso = leer(sessionStorage, AVISO);
    if (aviso) {
      borrar(sessionStorage, AVISO);
      const err = document.getElementById("loginError");
      if (err) err.textContent = aviso;
    }
  }

  // Otra pestaña cerró la sesión o se volvió a ingresar: recalcular.
  window.addEventListener("storage", e => { if (e.key === CLAVE) revisar(); });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) revisar(); });
})();
