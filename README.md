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

## Estilos comunes

`comun.css` define los tamaños compartidos (títulos, logo, letra, botones, pie de página). Lo cargan el portal y todas las herramientas: un cambio ahí se aplica en todas las páginas.

**Al modificar `comun.css` o `sesion.js`, cambiar el número de versión** de sus enlaces en las 6 páginas (por ejemplo `comun.css?v=20261003b` → `comun.css?v=20261010a`). GitHub Pages indica a los navegadores que guarden estos archivos 10 minutos; con un número nuevo los descargan de nuevo en el momento.

No subir nunca certificados ni claves (por ejemplo la carpeta `certificado` de Búsqueda de CUIT).
