# KukoScrapingFree-web

Web oficial de KukoScrapingFree: https://kukoxbmc.github.io/KukoScrapingFree-web/

## Módulos

Cada sección es su propia página: `index.html` (inicio), `funciones.html`, `galeria.html`,
`guia.html`, `novedades.html`, `descargar.html` y `404.html`. Al pasar de una a otra solo cambia el
contenido central, con una transición suave (`js/web.js`); sin JavaScript funcionan como enlaces normales.

## Cómo se editan

Las páginas se **generan**; no se editan a mano:

- `_fuente/plantilla.html`: lo común (cabecera, menú, pie, ventanas).
- `_fuente/paginas/<módulo>.html`: el contenido de cada módulo.
- `js/textos.js`: los textos en los 7 idiomas.
- `css/web.css`: el estilo.

Después de cambiar algo: `python3 _fuente/generar.py` (necesita Node para leer los textos).
La carpeta `_fuente` no se publica (GitHub Pages ignora lo que empieza por «_»).

`version.json` e `historial.json` los publica la compilación del programa: no se tocan a mano.
