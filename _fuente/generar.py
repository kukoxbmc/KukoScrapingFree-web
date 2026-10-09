#!/usr/bin/env python3
"""Genera las páginas de la web a partir de la plantilla y de cada módulo.

    python3 _fuente/generar.py

- _fuente/plantilla.html     → lo común: cabecera, menú, pie, ventanas y scripts.
- _fuente/paginas/<id>.html  → el contenido de cada módulo (lo que va dentro de <main>).
- js/textos.js               → los textos en los 7 idiomas. El castellano se mete también en
                               el HTML, para que la web se lea aunque el JavaScript no cargue.

Marcas que se pueden usar en los módulos:
    {{T:clave}}                         texto en castellano de js/textos.js
    {{PHEAD:id:kicker:titulo:entrada}}  cabecera de un módulo (con la ruta «Inicio / …»)
    {{CTA}}                             llamada final a descargar
    {{I_xxx}}                           iconos (ver ICONOS)

La carpeta _fuente empieza por «_», así que GitHub Pages no la publica.
"""
from __future__ import annotations

import html
import json
import re
import subprocess
import time
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
FUENTE = RAIZ / "_fuente"
WEB = "https://kukoxbmc.github.io/KukoScrapingFree-web/"

# id, archivo, clave del título, clave de la descripción, clave del menú
PAGINAS = [
    ("inicio", "index.html", "meta_title", "meta_desc", "nav_home"),
    ("funciones", "funciones.html", "mt_funciones", "md_funciones", "nav_features"),
    ("galeria", "galeria.html", "mt_galeria", "md_galeria", "nav_gallery"),
    ("guia", "guia.html", "mt_guia", "md_guia", "nav_guide"),
    ("novedades", "novedades.html", "mt_novedades", "md_novedades", "nav_news"),
    ("descargar", "descargar.html", "mt_descargar", "md_descargar", "nav_dl"),
    ("404", "404.html", "mt_404", "meta_desc", ""),
]
MENU = ["inicio", "funciones", "galeria", "guia", "novedades"]       # «Descargar» va en su botón

_S = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'
ICONOS = {
    "inicio": f'<svg {_S}><path d="M3 11l9-7 9 7"></path><path d="M5 10v10h5v-6h4v6h5V10"></path></svg>',
    "funciones": f'<svg {_S}><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect></svg>',
    "galeria": f'<svg {_S}><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="9" cy="10" r="2"></circle><path d="M21 16l-5-5-9 9"></path></svg>',
    "guia": f'<svg {_S}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"></path><path d="M4 19V5M8 7h7M8 11h5"></path></svg>',
    "novedades": f'<svg {_S}><path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3z"></path><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"></path></svg>',
}
ICONOS_SUELTOS = {
    "I_DESCARGA": f'<svg class="icon" {_S}><path d="M12 3v12M7 10l5 5 5-5M4 21h16"></path></svg>',
    "I_FLECHA": f'<svg width="16" height="16" {_S}><path d="M5 12h14M13 6l6 6-6 6"></path></svg>',
    "I_GUIA": ICONOS["guia"].replace("<svg ", '<svg class="icon" ', 1),
    "I_NOVEDADES": ICONOS["novedades"].replace("<svg ", '<svg class="icon" ', 1),
    "I_WIN": '<svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 5.5l7.5-1v7H3zM11.5 4.4L21 3v8.5h-9.5zM3 12.5h7.5v7L3 18.5zM11.5 12.5H21V21l-9.5-1.4z"></path></svg>',
    "I_LINUX": '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c-2.2 0-3 1.8-3 4 0 1.5-.4 2.6-1.4 4C6.3 12.8 5 15 5.6 17.5 6 19 7.5 20 9 20c1 0 2-.6 3-.6s2 .6 3 .6c1.5 0 3-1 3.4-2.5.6-2.5-.7-4.7-2-6.5-1-1.4-1.4-2.5-1.4-4 0-2.2-.8-4-3-4z"></path></svg>',
    "I_WIN_Y": '<svg width="20" height="20" viewBox="0 0 24 24" fill="#ffd400" aria-hidden="true"><path d="M3 5.5l7.5-1v7H3zM11.5 4.4L21 3v8.5h-9.5zM3 12.5h7.5v7L3 18.5zM11.5 12.5H21V21l-9.5-1.4z"></path></svg>',
    "I_LINUX_Y": '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffd400" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c-2.2 0-3 1.8-3 4 0 1.5-.4 2.6-1.4 4C6.3 12.8 5 15 5.6 17.5 6 19 7.5 20 9 20c1 0 2-.6 3-.6s2 .6 3 .6c1.5 0 3-1 3.4-2.5.6-2.5-.7-4.7-2-6.5-1-1.4-1.4-2.5-1.4-4 0-2.2-.8-4-3-4z"></path></svg>',
}

# enlaces de la web antigua (una sola página con anclas) → módulo nuevo
REDIRECCION = """var a={"funciones":"funciones.html","capturas":"galeria.html","como-funciona":"guia.html#pasos","historial":"novedades.html","preguntas":"guia.html#preguntas","descargar":"descargar.html","aviso":"descargar.html#aviso"}[location.hash.slice(1)];if(a)location.replace(a);
"""


def textos() -> dict:
    """Textos en castellano de js/textos.js (se leen con Node, que es JavaScript de verdad)."""
    js = "global.window={};" + (RAIZ / "js" / "textos.js").read_text(encoding="utf-8") + \
         ";process.stdout.write(JSON.stringify(window.TEXTOS.es))"
    return json.loads(subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True).stdout)


def main() -> None:
    T = textos()
    plantilla = (FUENTE / "plantilla.html").read_text(encoding="utf-8")
    v = time.strftime("%Y%m%d%H%M")

    def t(clave: str, attr: bool = False) -> str:
        if clave not in T:
            raise SystemExit(f"Falta el texto «{clave}» en js/textos.js")
        val = T[clave]
        return html.escape(val, quote=True) if attr else val

    def phead(m: re.Match) -> str:
        pid, kicker, titulo, entrada = m.group(1).split(":")
        nav = {p[0]: p[4] for p in PAGINAS}[pid]
        return (f'<section class="phead"><div class="wrap phead-in">\n'
                f'<p class="crumbs"><a href="index.html" data-t="nav_home">{t("nav_home")}</a>'
                f'<span aria-hidden="true">/</span><span data-t="{nav}">{t(nav)}</span></p>\n'
                f'<p class="kicker" data-t="{kicker}">{t(kicker)}</p>\n'
                f'<h1 tabindex="-1" data-t="{titulo}">{t(titulo)}</h1>\n'
                f'<p class="lead" data-t="{entrada}">{t(entrada)}</p>\n'
                f'</div></section>')

    cta = (f'<section class="wrap sec"><div class="ctaband rv">\n'
           f'<div><h2 data-t="cta_t">{t("cta_t")}</h2><p data-t="cta_d">{t("cta_d")}</p></div>\n'
           f'<div class="btns"><a class="btn btn-a" href="descargar.html">{ICONOS_SUELTOS["I_DESCARGA"]}'
           f'<span data-t="btn_download">{t("btn_download")}</span></a>'
           f'<a class="btn btn-b" href="guia.html" data-t="cta_guide">{t("cta_guide")}</a></div>\n'
           f'</div></section>')

    for pid, archivo, mt, md, _nav in PAGINAS:
        cont = (FUENTE / "paginas" / f"{pid}.html").read_text(encoding="utf-8")
        cont = re.sub(r"\{\{PHEAD:([^}]+)\}\}", phead, cont)
        # en la propia guía, la llamada final no ofrece «Ver la guía»
        cont = cont.replace("{{CTA}}", re.sub(r'<a class="btn btn-b" href="guia.html".*?</a>', "", cta) if pid == "guia" else cta)
        for k, val in ICONOS_SUELTOS.items():
            cont = cont.replace("{{%s}}" % k, val)
        # dentro de atributos (alt="…", placeholder="…") el texto va escapado
        cont = re.sub(r'="\{\{T:([a-z0-9_]+)\}\}', lambda m: '="' + t(m.group(1), attr=True), cont)
        cont = re.sub(r'\{\{T:([a-z0-9_]+)\}\}', lambda m: t(m.group(1)), cont)
        nav = []
        tab = []
        for mid in MENU:
            arch = {p[0]: p[1] for p in PAGINAS}[mid]
            clave = {p[0]: p[4] for p in PAGINAS}[mid]
            cur = ' aria-current="page"' if mid == pid else ""
            nav.append(f'<a href="{arch}" data-nav="{mid}"{cur}>{ICONOS[mid]}<span data-t="{clave}">{t(clave)}</span></a>')
            tab.append(f'<a href="{arch}" data-nav="{mid}"{cur}>{ICONOS[mid]}<span data-t="{clave}">{t(clave)}</span></a>')
        url = WEB + ("" if archivo == "index.html" else archivo)
        out = plantilla
        rep = {
            "{{BASE}}": '<base href="/KukoScrapingFree-web/">\n' if pid == "404" else "",
            "{{TITULO}}": t(mt, attr=True), "{{DESCRIPCION}}": t(md, attr=True), "{{URL}}": url,
            "{{PAGINA}}": pid, "{{MT}}": mt, "{{MD}}": md, "{{V}}": v,
            "{{NAV}}": "\n".join(nav), "{{TABBAR}}": "\n".join(tab),
            "{{CTA_ACTUAL}}": ' aria-current="page"' if pid == "descargar" else "",
            "{{REDIRECCION}}": REDIRECCION if pid == "inicio" else "",
            "{{CONTENIDO}}": cont.strip(),
        }
        for k, val in rep.items():
            out = out.replace(k, val)
        if "{{" in out:
            raise SystemExit(f"{archivo}: queda una marca sin sustituir: {out[out.index('{{'):][:40]}")
        (RAIZ / archivo).write_text(out, encoding="utf-8")
        print(f"  {archivo:16} {len(out) // 1024:4} KB")


if __name__ == "__main__":
    main()
