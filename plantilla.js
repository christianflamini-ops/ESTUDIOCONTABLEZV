/* Plantilla de Excel para empezar sin un Excel previo.
   Cada herramienta llama a descargarPlantillaExcel({...}) con su propia hoja de datos
   (los mismos títulos de columna que lee su "Importar Excel") y la explicación de cada columna.
   El libro sale con la hoja de datos vacía y una hoja INSTRUCCIONES, que es la que se ve al abrirlo.
   La hoja INSTRUCCIONES no se importa: cada herramienta busca su hoja de datos por nombre. */
(function () {
  function hojaInstrucciones(cfg) {
    const filas = [];
    const marcas = []; // filas de títulos, para darles ancho de lectura
    filas.push(["PLANTILLA — " + cfg.herramienta]);
    filas.push(["Estudio Contable Z&V"]);
    filas.push([]);
    filas.push(["CÓMO USARLA"]); marcas.push(filas.length - 1);
    (cfg.pasos || []).forEach((p, i) => filas.push([(i + 1) + ". " + p]));
    filas.push([]);
    filas.push(["COLUMNAS DE LA HOJA «" + cfg.hojaDatos + "»"]); marcas.push(filas.length - 1);
    filas.push(["Columna", "¿Obligatoria?", "Qué poner", "Ejemplo"]);
    (cfg.columnas || []).forEach(c => filas.push([c[0], c[1] ? "Sí" : "No", c[2], c[3] == null ? "" : c[3]]));
    if (cfg.avisos && cfg.avisos.length) {
      filas.push([]);
      filas.push(["IMPORTANTE"]); marcas.push(filas.length - 1);
      cfg.avisos.forEach(a => filas.push(["• " + a]));
    }
    const ws = XLSX.utils.aoa_to_sheet(filas);
    ws["!cols"] = [{ wch: 34 }, { wch: 13 }, { wch: 78 }, { wch: 34 }];
    return ws;
  }

  window.descargarPlantillaExcel = function (cfg) {
    if (typeof XLSX === "undefined") {
      throw new Error("No se pudo cargar el generador de Excel. Revisá tu conexión y recargá la página.");
    }
    const wb = XLSX.utils.book_new();
    cfg.hojas.forEach(h => {
      const ws = h.ws || XLSX.utils.aoa_to_sheet(h.filas);
      if (h.anchos) ws["!cols"] = h.anchos.map(w => ({ wch: w }));
      XLSX.utils.book_append_sheet(wb, ws, h.nombre);
    });
    XLSX.utils.book_append_sheet(wb, hojaInstrucciones(cfg), "INSTRUCCIONES");
    // Que el archivo se abra mostrando las instrucciones.
    wb.Workbook = { Views: [{ activeTab: cfg.hojas.length }] };
    XLSX.writeFile(wb, cfg.archivo);
  };
})();
