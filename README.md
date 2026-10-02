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

1. En GitHub, crear un repositorio nuevo llamado `herramientas-zv`.
2. Subir esta carpeta (ver los comandos en la conversación, o arrastrar los archivos en "Add file → Upload files").
3. En el repositorio: **Settings → Pages → Source: Deploy from a branch → main / (root)**.
4. El sitio queda en `https://<usuario>.github.io/herramientas-zv/`.

## Configuración pendiente después de publicar

- **Firebase:** Console → Authentication → Settings → Authorized domains → agregar `<usuario>.github.io`.
- **Google Cloud (borradores de Gmail):** APIs y servicios → Credenciales → ID de cliente OAuth → Orígenes de JavaScript autorizados → agregar `https://<usuario>.github.io`.
- **Consulta de CUITs:** en el Worker de Cloudflare `consulta-cuits`, agregar `https://<usuario>.github.io` a la variable `ALLOWED_ORIGINS`.

## Actualizar una herramienta

Copiar el `index.html` nuevo de la herramienta a su carpeta en este repositorio y subir el cambio. GitHub Pages lo publica en uno o dos minutos.

No subir nunca certificados ni claves (por ejemplo la carpeta `certificado` de Búsqueda de CUIT).
