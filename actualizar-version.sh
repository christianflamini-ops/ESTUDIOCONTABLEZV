#!/usr/bin/env bash
# Actualiza el número de versión del sitio antes de publicar (ejecutar desde Git Bash en esta carpeta).
#  - version.json: la versión publicada, que consultan las páginas para avisar que hay una nueva.
#  - <meta name="zv-version"> de cada página: la versión con la que se publicó esa página.
#  - ?v=... de los archivos comunes (comun.css, sesion.js, resumen.js, plantilla.js, enter.js,
#    version.js, meses.js, papelera.js): obliga a los navegadores a descargar la copia nueva.
set -euo pipefail
cd "$(dirname "$0")"
V="${1:-$(date +%Y%m%d-%H%M)}"
PAGINAS=(index.html */index.html)
sed -i -E "s#(<meta name=\"zv-version\" content=\")[^\"]*(\">)#\1$V\2#" "${PAGINAS[@]}"
sed -i -E "s#((comun\.css|sesion\.js|resumen\.js|plantilla\.js|enter\.js|version\.js|meses\.js|papelera\.js)\?v=)[0-9A-Za-z-]+#\1$V#g" "${PAGINAS[@]}"
printf '{ "version": "%s" }\n' "$V" > version.json
echo "Versión del sitio: $V"
grep -c "zv-version\" content=\"$V\"" "${PAGINAS[@]}"
