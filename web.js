/* KukoScrapingFree — web: idioma, contador de visitas y contador de descargas. */
(function () {
  "use strict";

  var T = window.TEXTOS || {};
  var IDIOMAS = [
    { code: "es", name: "Español",   locale: "es_ES" },
    { code: "en", name: "English",   locale: "en_GB" },
    { code: "fr", name: "Français",  locale: "fr_FR" },
    { code: "de", name: "Deutsch",   locale: "de_DE" },
    { code: "pt", name: "Português", locale: "pt_PT" },
    { code: "ru", name: "Русский",   locale: "ru_RU" },
    { code: "it", name: "Italiano",  locale: "it_IT" }
  ];

  // Banderas dibujadas en SVG (igual que en el programa): no dependen de emojis del sistema.
  var BANDERAS = {
    es: '<rect width="30" height="20" fill="#c60b1e"/><rect y="5" width="30" height="10" fill="#ffc400"/>',
    en: '<rect width="30" height="20" fill="#012169"/><path d="M0 0L30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0L30 20M30 0L0 20" stroke="#c8102e" stroke-width="1.6"/><path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="6"/><path d="M15 0v20M0 10h30" stroke="#c8102e" stroke-width="3.4"/>',
    fr: '<rect width="10" height="20" fill="#002395"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ed2939"/>',
    de: '<rect width="30" height="7" fill="#000"/><rect y="6.67" width="30" height="6.67" fill="#dd0000"/><rect y="13.33" width="30" height="6.67" fill="#ffce00"/>',
    pt: '<rect width="30" height="20" fill="#ff0000"/><rect width="12" height="20" fill="#006600"/><circle cx="12" cy="10" r="4" fill="#ffcc00"/><circle cx="12" cy="10" r="2.4" fill="#ff0000"/>',
    ru: '<rect width="30" height="7" fill="#fff"/><rect y="6.67" width="30" height="6.67" fill="#0039a6"/><rect y="13.33" width="30" height="6.67" fill="#d52b1e"/>',
    it: '<rect width="10" height="20" fill="#009246"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ce2b37"/>'
  };
  function bandera(code) {
    return '<svg class="flag" viewBox="0 0 30 20" aria-hidden="true" preserveAspectRatio="none">' + BANDERAS[code] + "</svg>";
  }

  function guardar(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function leer(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  function idiomaInicial() {
    var g = leer("kuko-idioma");
    if (g && T[g]) return g;
    var prefs = navigator.languages || [navigator.language || "en"];
    for (var i = 0; i < prefs.length; i++) {
      var c = String(prefs[i]).slice(0, 2).toLowerCase();
      if (T[c]) return c;
    }
    return "en";
  }

  var actual = "es";

  function aplicarIdioma(code) {
    var tx = T[code] || T.es;
    actual = code;
    var info = IDIOMAS.filter(function (x) { return x.code === code; })[0];
    document.documentElement.lang = code;
    document.title = tx.meta_title;
    var setMeta = function (sel, val) { var m = document.querySelector(sel); if (m) m.setAttribute("content", val); };
    setMeta('meta[name="description"]', tx.meta_desc);
    setMeta('meta[property="og:title"]', tx.meta_title);
    setMeta('meta[property="og:description"]', tx.meta_desc);
    setMeta('meta[property="og:locale"]', info.locale);

    document.querySelectorAll("[data-t]").forEach(function (el) {
      var v = tx[el.getAttribute("data-t")]; if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-h]").forEach(function (el) {
      var v = tx[el.getAttribute("data-h")]; if (v != null) el.innerHTML = v;  // textos propios, no del usuario
    });
    document.querySelectorAll("[data-alt]").forEach(function (el) {
      var v = tx[el.getAttribute("data-alt")]; if (v == null) return;
      var extra = el.getAttribute("data-alt-extra");
      el.setAttribute("alt", extra ? v + ": " + extra : v);
    });
    document.querySelectorAll("[data-title]").forEach(function (el) {
      var v = tx[el.getAttribute("data-title")]; if (v != null) { el.setAttribute("title", v); el.setAttribute("aria-label", v + ": " + info.name); }
    });

    document.getElementById("lang-flag").innerHTML = bandera(code);
    document.getElementById("lang-name").textContent = info.name;
    document.querySelectorAll("#lang-menu button").forEach(function (b) {
      b.setAttribute("aria-checked", b.getAttribute("data-code") === code ? "true" : "false");
    });
    pintarDescargas();
    if (typeof pintarVersion === "function") pintarVersion();
  }

  // ---------------- selector de idioma ----------------
  var caja = document.getElementById("lang");
  var boton = document.getElementById("lang-btn");
  var menu = document.getElementById("lang-menu");
  IDIOMAS.forEach(function (i) {
    var li = document.createElement("li");
    li.setAttribute("role", "none");
    li.innerHTML = '<button type="button" role="menuitemradio" data-code="' + i.code + '">' + bandera(i.code) + "<span>" + i.name + "</span></button>";
    menu.appendChild(li);
  });
  function abrir(si) {
    caja.classList.toggle("open", si);
    boton.setAttribute("aria-expanded", si ? "true" : "false");
    if (si) { var s = menu.querySelector('[aria-checked="true"]') || menu.querySelector("button"); s.focus(); }
  }
  boton.addEventListener("click", function (e) { e.stopPropagation(); abrir(!caja.classList.contains("open")); });
  menu.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-code]"); if (!b) return;
    var c = b.getAttribute("data-code");
    guardar("kuko-idioma", c); aplicarIdioma(c); abrir(false); boton.focus();
  });
  menu.addEventListener("keydown", function (e) {
    var bs = Array.prototype.slice.call(menu.querySelectorAll("button"));
    var i = bs.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); bs[(i + 1) % bs.length].focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); bs[(i - 1 + bs.length) % bs.length].focus(); }
    else if (e.key === "Escape") { abrir(false); boton.focus(); }
  });
  document.addEventListener("click", function (e) { if (!caja.contains(e.target)) abrir(false); });

  // ---------------- contadores ----------------
  function pintarDigitos(id, valor) {
    var el = document.getElementById(id);
    if (!el) return;
    var min = parseInt(el.getAttribute("data-min") || "4", 10);
    var s;
    if (valor == null) { s = ""; for (var k = 0; k < min; k++) s += "-"; }
    else { s = String(Math.max(0, Math.floor(valor))); while (s.length < min) s = "0" + s; }
    el.innerHTML = s.split("").map(function (d) { return '<span class="digit">' + d + "</span>"; }).join("");
    var fmt = valor == null ? "—" : new Intl.NumberFormat(actual).format(valor);
    el.setAttribute("aria-label", fmt);
    el.setAttribute("role", "img");
  }

  // Visitas: contador público Abacus. Se suma una sola vez por sesión del navegador.
  var ABACUS = "https://abacus.jasoncameron.dev";
  var CLAVE = "kukoxbmc-kukoscrapingfree/visitas";
  function contarVisita() {
    var yaContada = false;
    try { yaContada = sessionStorage.getItem("kuko-visita") === "1"; } catch (e) {}
    var url = ABACUS + (yaContada ? "/get/" : "/hit/") + CLAVE;
    fetch(url, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) {
        if (typeof j.value !== "number") throw new Error("sin valor");
        try { sessionStorage.setItem("kuko-visita", "1"); } catch (e) {}
        pintarDigitos("cnt-visitas", j.value);
      })
      .catch(function () { pintarDigitos("cnt-visitas", null); });
  }

  // Descargas: suma de todas las versiones publicadas en GitHub.
  var descargas = { win: null, linux: null };
  function pintarDescargas() {
    pintarDigitos("cnt-windows", descargas.win);
    pintarDigitos("cnt-linux", descargas.linux);
  }
  function contarDescargas() {
    fetch("https://api.github.com/repos/kukoxbmc/KukoScrapingFree-web/releases?per_page=100", {
      headers: { Accept: "application/vnd.github+json" }
    })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (rels) {
        var w = 0, l = 0;
        rels.forEach(function (rel) {
          if (rel.draft) return;
          (rel.assets || []).forEach(function (a) {
            var n = (a.name || "").toLowerCase();
            if (n.indexOf("-windows") >= 0) w += a.download_count || 0;
            else if (n.indexOf("-linux") >= 0) l += a.download_count || 0;
          });
        });
        descargas.win = w; descargas.linux = l;
        pintarDescargas();
      })
      .catch(function () { pintarDescargas(); });
  }

  // Enlaces directos a los zips de la última versión (version.json lo actualiza la compilación).
  var version = null;
  function pintarVersion() {
    if (!version) return;
    var tx = T[actual] || T.es;
    document.getElementById("dl-ver").textContent = (tx.dl_version || "v{v}").replace("{v}", version);
  }
  function leerVersion() {
    fetch("version.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) {
        if (!j.version || !/^[0-9][0-9.]*$/.test(j.version)) return;
        version = j.version;
        var base = "https://github.com/kukoxbmc/KukoScrapingFree-web/releases/download/v" + version + "/KukoScrapingFree-" + version;
        document.getElementById("dl-win").href = base + "-windows.zip";
        document.getElementById("dl-linux").href = base + "-linux.zip";
        pintarVersion();
      })
      .catch(function () {});
  }

  aplicarIdioma(idiomaInicial());
  leerVersion();
  pintarDigitos("cnt-visitas", null);
  contarVisita();
  contarDescargas();
})();
