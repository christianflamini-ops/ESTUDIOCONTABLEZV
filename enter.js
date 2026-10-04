/* Enter para guardar o agregar sin hacer clic en el botón.
   Al presionar Enter en un campo, se busca el botón de guardar/agregar del mismo recuadro
   (la tarjeta del cliente, el panel de alta, los vencimientos…) y se lo toca.
   - Los cuadros de texto largos (textarea, texto editable) siguen haciendo salto de línea.
   - Si el campo ya tiene su propio Enter (ingreso, correo, nombre…), se respeta ese.
   - Si el botón está desactivado (todavía no hay cambios), no hace nada.
   - Nunca sale del recuadro: el buscador y los filtros de arriba no disparan nada. */
(function () {
  const BOTONES = [
    "[data-save-honorarios]",         // VEP Monotributo y Cobranzas: guardar importe/honorarios del cliente
    "[data-role=\"save-card\"]",      // VEP Autónomos: guardar monto del cliente
    "#saveVtosBtn",                   // VEP Autónomos: guardar vencimientos del período
    "#nc-submit",                     // VEP Monotributo y Cobranzas: agregar cliente nuevo
    "#saveNewClienteBtn",             // VEP Autónomos: agregar cliente nuevo
    "[data-act=\"agregar-ok\"]",      // Informe Mensual: agregar cliente nuevo
    "[data-act=\"guardar-datos\"]",   // Informe Mensual: guardar datos del cliente
    "[data-act=\"guardar-meses\"]",   // Informe Mensual: guardar facturación y gastos
    "#periodoContinuar"               // Informe Mensual: confirmar el período al entrar
  ].join(",");
  const LIMITES = "#appRoot, .app, main, body"; // no se busca más allá de estos contenedores
  const TIPOS_IGNORADOS = ["checkbox", "file", "button", "submit", "reset", "range", "color"];

  function visible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  document.addEventListener("keydown", e => {
    if (e.key !== "Enter" || e.defaultPrevented || e.isComposing) return;
    if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
    const campo = e.target;
    if (campo === document.body || campo === document.documentElement) {
      // Pantalla de ingreso visible sin el cursor en un campo (por ejemplo, el navegador
      // completó solo el email y la contraseña): Enter ingresa.
      const ingreso = document.getElementById("loginGate");
      const ingresar = document.getElementById("loginSubmit");
      if (ingreso && ingresar && visible(ingreso) && !ingresar.disabled) { e.preventDefault(); ingresar.click(); return; }
      // Informe Mensual: al entrar pide confirmar el período sin ningún campo con el cursor.
      const continuar = document.getElementById("periodoContinuar");
      if (continuar && visible(continuar) && !continuar.disabled) { e.preventDefault(); continuar.click(); }
      return;
    }
    const esInput = campo instanceof HTMLInputElement && !TIPOS_IGNORADOS.includes(campo.type);
    const esSelect = campo instanceof HTMLSelectElement;
    if (!esInput && !esSelect) return;      // textarea y texto editable: Enter = salto de línea
    if (campo.form) return;                 // los formularios ya envían con Enter
    if (campo.closest("#loginGate")) return; // el ingreso ya tiene su propio Enter

    for (let cont = campo.parentElement; cont && !cont.matches(LIMITES); cont = cont.parentElement) {
      const boton = Array.from(cont.querySelectorAll(BOTONES)).find(visible);
      if (!boton) continue;
      e.preventDefault();
      if (!boton.disabled) boton.click(); // desactivado = todavía no hay nada para guardar
      return;
    }
  });
})();
