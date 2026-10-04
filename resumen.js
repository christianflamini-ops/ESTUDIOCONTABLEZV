/* Resumen del mes para el portal.
   Cada herramienta llama a publicarResumen(herramienta, mes, datos) cuando calcula sus
   números (los mismos que muestra arriba: clientes, pendientes, enviados…). Se guardan en
   resumenPortal/<herramienta>/<AAAA-MM> y el portal los muestra en la tarjeta de cada herramienta.
   Solo se escribe cuando los números cambian, agrupando los cambios de un mismo momento. */
(function () {
  const pendientes = {};
  const ultimos = {};
  let temporizador = null;

  function disponible() {
    return typeof firebase !== "undefined" && firebase.apps.length &&
      typeof firebase.database === "function" && typeof firebase.auth === "function" &&
      !!firebase.auth().currentUser;
  }

  function enviar() {
    Object.keys(pendientes).forEach(clave => {
      const { datos, json } = pendientes[clave];
      delete pendientes[clave];
      if (!disponible()) return;
      const registro = Object.assign({}, datos, { actualizado: firebase.database.ServerValue.TIMESTAMP });
      firebase.database().ref("resumenPortal/" + clave).set(registro)
        .then(() => { ultimos[clave] = json; })
        .catch(() => {});
    });
  }

  // Fecha del último "Exportar Excel" de cada herramienta (el Excel es la copia de respaldo).
  // El portal la muestra y avisa si pasó más de un mes.
  window.registrarExportacion = function (herramienta) {
    if (!herramienta || !disponible()) return;
    firebase.database().ref("exportacionesExcel/" + herramienta)
      .set({ fecha: firebase.database.ServerValue.TIMESTAMP })
      .catch(() => {});
  };

  window.publicarResumen = function (herramienta, mes, datos) {
    if (!herramienta || !/^\d{4}-\d{2}$/.test(mes || "") || !disponible()) return;
    const clave = herramienta + "/" + mes;
    const json = JSON.stringify(datos);
    if (ultimos[clave] === json) return;
    pendientes[clave] = { datos, json };
    clearTimeout(temporizador);
    temporizador = setTimeout(enviar, 1500);
  };
})();
