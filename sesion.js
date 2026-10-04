/* Duración fija de la sesión para el portal y todas las herramientas.
   La sesión se cierra a las 2 horas de haber ingresado, se esté usando o no.
   La hora de ingreso se guarda en el navegador y la comparten todas las páginas
   del sitio, así que pasar de una herramienta a otra no reinicia el plazo. */
(function () {
  const DURACION_SESION_MS = 120 * 60 * 1000;
  const CLAVE = "zv_sesion_inicio";
  const MENSAJE = "La sesión se cerró automáticamente a las 2 horas. Volvé a ingresar.";

  if (typeof firebase === "undefined" || !firebase.apps.length || typeof firebase.auth !== "function") return;

  function leerInicio() {
    try { return Number(localStorage.getItem(CLAVE)) || 0; } catch (e) { return 0; }
  }
  function guardarInicio(ms) {
    try { localStorage.setItem(CLAVE, String(ms)); } catch (e) {}
  }
  function borrarInicio() {
    try { localStorage.removeItem(CLAVE); } catch (e) {}
  }

  let inicioEnMemoria = 0;
  let timer = null;
  let vigilancia = null;
  let cerradaPorTiempo = false;

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

  firebase.auth().onAuthStateChanged(user => {
    clearTimeout(timer);
    clearInterval(vigilancia);
    if (user) {
      let inicio = leerInicio();
      if (!inicio) { inicio = Date.now(); guardarInicio(inicio); }
      inicioEnMemoria = inicio;
      const restante = inicio + DURACION_SESION_MS - Date.now();
      if (restante <= 0) { cerrar(); return; }
      timer = setTimeout(cerrar, restante);
      // Por si la computadora se suspende y el temporizador se atrasa.
      vigilancia = setInterval(revisar, 30 * 1000);
    } else {
      borrarInicio();
      inicioEnMemoria = 0;
      if (cerradaPorTiempo) {
        cerradaPorTiempo = false;
        setTimeout(() => {
          const err = document.getElementById("loginError");
          if (err) err.textContent = MENSAJE;
        }, 50);
      }
    }
  });

  // Otra pestaña cerró la sesión o se volvió a ingresar: recalcular.
  window.addEventListener("storage", e => { if (e.key === CLAVE) revisar(); });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) revisar(); });
})();
