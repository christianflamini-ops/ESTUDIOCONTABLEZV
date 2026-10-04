# Herramientas Z&V

Portal interno del Estudio Contable Z&V. Al entrar pide el email y la contraseña del equipo (Firebase, proyecto `cobranzas-cdra`). La sesión se comparte con todas las herramientas del sitio.

| Carpeta | Herramienta |
|---|---|
| `/` | Portal con ingreso |
| `gestion-de-cobranzas/` | Gestión de Cobranzas |
| `vep-monotributo/` | VEP Monotributo Mensual |
| `vep-autonomos/` | VEP Autónomos Mensual |
| `consulta-cuits/` | Consulta de CUITs |
| `informe-monotributo/` | Informe Mensual Monotributo |

## Publicar en GitHub Pages

1. En GitHub, crear un repositorio nuevo llamado `ESTUDIOCONTABLEZV`.
2. Subir esta carpeta (ver los comandos en la conversación, o arrastrar los archivos en "Add file → Upload files").
3. En el repositorio: **Settings → Pages → Source: Deploy from a branch → main / (root)**.
4. El sitio queda en `https://christianflamini-ops.github.io/ESTUDIOCONTABLEZV/`.

## Configuración pendiente después de publicar

- **Firebase:** Console → Authentication → Settings → Authorized domains → agregar `christianflamini-ops.github.io`.
- **Google Cloud (borradores de Gmail):** APIs y servicios → Credenciales → ID de cliente OAuth → Orígenes de JavaScript autorizados → agregar `https://christianflamini-ops.github.io`.
- **Consulta de CUITs:** en el Worker de Cloudflare `consulta-cuits`, agregar `https://christianflamini-ops.github.io` a la variable `ALLOWED_ORIGINS`.

## Actualizar una herramienta

**Este repositorio es la única versión oficial de las herramientas.** Los cambios se hacen directamente en el `index.html` de cada carpeta de acá y después se suben a GitHub. GitHub Pages los publica en uno o dos minutos.

Las carpetas de cada herramienta en el Escritorio (GESTION DE COBRANZAS, VEP MONOTRIBUTO MENSUAL, etc.) conservan la versión anterior renombrada como `index (version vieja).html`. Cada una de esas carpetas tiene un aviso (`LEEME…txt` y `CLAUDE.md`) que apunta acá. No hay que copiarlos encima de los de este repositorio, porque no tienen los agregados del sitio:

- El enlace a los estilos comunes: `<link rel="stylesheet" href="../comun.css">` después del primer `</style>`.
- El control de duración de la sesión: `<script src="../sesion.js"></script>` al final, con el cierre por inactividad propio de la herramienta desactivado.
- El ícono compartido `../favicon.png`.
- El botón "Volver al portal", la fecha y hora, el correo de la sesión junto a "Cerrar sesión" y el recuadro "¿Cómo funciona?".

## Duración de la sesión

`sesion.js` cierra la sesión a las 2 horas de haber ingresado, se esté usando o no. El plazo es el mismo en todas las páginas: pasar de una herramienta a otra no lo reinicia. Para cambiar la duración, editar `DURACION_SESION_MS` en ese archivo.

## Estado del mes en el portal

Cada tarjeta del portal muestra el estado del mes de su herramienta:

- **VEP Monotributo, VEP Autónomos, Gestión de Cobranzas e Informe Mensual:** al calcular sus contadores (los que muestran arriba), cada herramienta los guarda en la nube en `resumenPortal/<herramienta>/<AAAA-MM>` mediante `resumen.js`. El portal muestra esos mismos números. Se actualizan cada vez que alguien abre o usa la herramienta; si en el mes todavía nadie la abrió, la tarjeta lo indica.
- **Consulta de CUITs:** el portal cuenta los CUIT consultados en el mes y le pide al servidor la fecha de vencimiento del certificado de ARCA. Si faltan 60 días o menos (o ya venció), muestra un aviso arriba de las herramientas.

## Recordatorio del Excel de respaldo

La base de datos de Firebase (plan gratuito) no tiene copias de seguridad automáticas: el Excel exportado de cada herramienta es el respaldo. Al usar "Exportar Excel", la herramienta guarda la fecha en `exportacionesExcel/<herramienta>` (`resumen.js`), y el portal la muestra en su tarjeta. Si pasaron más de 31 días (`DIAS_RESPALDO` en `index.html`) o nunca se exportó desde el sitio, la marca en naranja.

## Plantillas de Excel

VEP Monotributo, VEP Autónomos, Gestión de Cobranzas e Informe Mensual tienen el botón **Descargar plantilla** en su recuadro "Datos del Excel". Descarga un Excel con la hoja de datos vacía (los mismos títulos que lee "Importar Excel") y una hoja INSTRUCCIONES que explica cada columna. El armado común está en `plantilla.js`; las columnas y explicaciones de cada herramienta están en su propio `index.html`. Si se cambian las columnas que lee el importador de una herramienta, hay que actualizar también su plantilla.

La función "Cambios pendientes" (un resumen para pasarle a Claude y que actualizara el Excel) quedó oculta desde `comun.css`: para tener la planilla al día alcanza con "Exportar Excel" y reemplazar el archivo anterior. Su código sigue en cada herramienta, sin uso, porque otras partes lo llaman.

En las cuatro herramientas, "Importar Excel" suma al contenido actual: los clientes que ya están se actualizan, los nuevos se agregan y no se borra ninguno. Las celdas vacías del archivo no borran datos ya cargados. VEP Autónomos reconoce a los clientes por CUIT; Informe Mensual, por CUIT o por nombre; VEP Monotributo y Cobranzas, por nombre.

## Enter para guardar

`enter.js` hace que, en VEP Monotributo, VEP Autónomos, Cobranzas e Informe Mensual, presionar Enter en un campo toque el botón de guardar o agregar de ese mismo recuadro (lista de botones en `BOTONES`). No actúa en cuadros de texto largos, en el buscador ni si el botón está desactivado. El ingreso (portal y herramientas) ya ingresaba con Enter.

## Estilos comunes

`comun.css` define los tamaños compartidos (títulos, logo, letra, botones, pie de página). Lo cargan el portal y todas las herramientas: un cambio ahí se aplica en todas las páginas.

**Al modificar `comun.css`, `sesion.js`, `resumen.js` o `plantilla.js`, cambiar el número de versión** de sus enlaces en las 6 páginas (por ejemplo `comun.css?v=20261003b` → `comun.css?v=20261010a`). GitHub Pages indica a los navegadores que guarden estos archivos 10 minutos; con un número nuevo los descargan de nuevo en el momento.

No subir nunca certificados ni claves (por ejemplo la carpeta `certificado` de Búsqueda de CUIT).
