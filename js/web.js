/* KukoScrapingFree — web por módulos.
   Cada módulo (inicio, funciones, galería, guía, novedades, descargar) es su propia página.
   Al pulsar el menú no se recarga la página: se trae el módulo nuevo, se cambia solo el
   contenido central con una transición suave y la dirección del navegador se actualiza.
   Si algo falla (o no hay JavaScript), los enlaces funcionan como siempre.
   También: idioma, tema, contadores, versión, historial, antes/después, pestañas, buscadores,
   galería, vídeo y animaciones al bajar. */
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
  var $ = function (id) { return document.getElementById(id); };
  function texto(id, v) { var el = $(id); if (el) el.textContent = v; return el; }
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function main() { return document.querySelector("main"); }

  // ================================================================ idioma
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
  function tx() { return T[actual] || T.es || {}; }

  function aplicarIdioma(code) {
    actual = T[code] ? code : "es";
    var t = tx();
    var info = IDIOMAS.filter(function (x) { return x.code === actual; })[0];
    document.documentElement.lang = actual;
    var m = main();
    var mt = (m && m.getAttribute("data-mt")) || "meta_title", md = (m && m.getAttribute("data-md")) || "meta_desc";
    if (t[mt]) document.title = t[mt];
    var setMeta = function (sel, val) { var e = document.querySelector(sel); if (e && val) e.setAttribute("content", val); };
    setMeta('meta[name="description"]', t[md]);
    setMeta('meta[property="og:title"]', t[mt]);
    setMeta('meta[property="og:description"]', t[md]);
    setMeta('meta[property="og:locale"]', info.locale);
    document.querySelectorAll("[data-t]").forEach(function (el) {
      var v = t[el.getAttribute("data-t")]; if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-h]").forEach(function (el) {
      var v = t[el.getAttribute("data-h")]; if (v != null) el.innerHTML = v;   // textos propios
    });
    document.querySelectorAll("[data-alt]").forEach(function (el) {
      var v = t[el.getAttribute("data-alt")]; if (v == null) return;
      var extra = el.getAttribute("data-alt-extra");
      var txt = extra ? v + ": " + extra : v;
      el.setAttribute(el.tagName === "VIDEO" ? "aria-label" : "alt", txt);
    });
    document.querySelectorAll("[data-title]").forEach(function (el) {
      var v = t[el.getAttribute("data-title")]; if (v == null) return;
      el.setAttribute("title", v);
      el.setAttribute("aria-label", el.id === "lang-btn" ? v + ": " + info.name : v);
    });
    document.querySelectorAll("[data-label]").forEach(function (el) {
      var v = t[el.getAttribute("data-label")]; if (v != null) el.setAttribute("aria-label", v);
    });
    document.querySelectorAll("[data-ph]").forEach(function (el) {
      var v = t[el.getAttribute("data-ph")]; if (v != null) el.setAttribute("placeholder", v);
    });
    $("lang-flag").innerHTML = bandera(actual);
    $("lang-name").textContent = info.name;
    document.querySelectorAll("#lang-menu button").forEach(function (b) {
      b.setAttribute("aria-checked", b.getAttribute("data-code") === actual ? "true" : "false");
    });
    pintarTodo(false);
  }

  var caja = $("lang"), boton = $("lang-btn"), menu = $("lang-menu");
  IDIOMAS.forEach(function (i) {
    var li = document.createElement("li");
    li.setAttribute("role", "none");
    li.innerHTML = '<button type="button" role="menuitemradio" data-code="' + i.code + '">' + bandera(i.code) + "<span>" + i.name + "</span></button>";
    menu.appendChild(li);
  });
  function abrirMenu(si) {
    menu.hidden = !si;
    boton.setAttribute("aria-expanded", si ? "true" : "false");
    if (si) { var s = menu.querySelector('[aria-checked="true"]') || menu.querySelector("button"); s.focus(); }
  }
  boton.addEventListener("click", function (e) { e.stopPropagation(); abrirMenu(menu.hidden); });
  menu.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-code]"); if (!b) return;
    guardar("kuko-idioma", b.getAttribute("data-code"));
    aplicarIdioma(b.getAttribute("data-code")); abrirMenu(false); boton.focus();
    filtrarFaq(); filtrarHistorial();
  });
  menu.addEventListener("keydown", function (e) {
    var bs = Array.prototype.slice.call(menu.querySelectorAll("button"));
    var i = bs.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); bs[(i + 1) % bs.length].focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); bs[(i - 1 + bs.length) % bs.length].focus(); }
    else if (e.key === "Escape") { abrirMenu(false); boton.focus(); }
  });
  document.addEventListener("click", function (e) { if (!caja.contains(e.target)) abrirMenu(false); });

  // ================================================================ tema claro / oscuro
  var root = document.documentElement;
  function temaEfectivo() {
    var t = root.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  function pintarTema() {
    var claro = temaEfectivo() === "light";
    $("ico-sun").hidden = claro;          // en oscuro se ofrece el sol (pasar a claro)
    $("ico-moon").hidden = !claro;
  }
  var guardado = leer("kuko-tema");
  if (guardado === "light" || guardado === "dark") root.setAttribute("data-theme", guardado);
  $("theme-btn").addEventListener("click", function () {
    var nuevo = temaEfectivo() === "light" ? "dark" : "light";
    var cambiar = function () { root.setAttribute("data-theme", nuevo); pintarTema(); };
    // el cambio de tema también se funde suavemente donde el navegador lo permite
    if (document.startViewTransition && !reduce) document.startViewTransition(cambiar); else cambiar();
    guardar("kuko-tema", nuevo);
  });
  if (window.matchMedia) {
    var mq = matchMedia("(prefers-color-scheme: light)");
    if (mq.addEventListener) mq.addEventListener("change", pintarTema);
  }
  pintarTema();

  // ================================================================ cabecera
  var top = $("top");
  function alBajar() { top.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", alBajar, { passive: true });
  alBajar();

  // ================================================================ navegación entre módulos
  var PAGINAS = { "": 1, "index.html": 1, "funciones.html": 1, "galeria.html": 1, "guia.html": 1, "novedades.html": 1, "descargar.html": 1 };
  var base = location.pathname.replace(/[^/]*$/, "");          // carpeta de la web
  var cache = {};
  var carga = $("carga");
  function nombre(url) { return url.pathname.slice(base.length); }
  function esModulo(url) {
    return url.origin === location.origin && url.pathname.indexOf(base) === 0 &&
           Object.prototype.hasOwnProperty.call(PAGINAS, nombre(url));
  }
  function traer(href) {
    if (!cache[href]) {
      cache[href] = fetch(href, { credentials: "same-origin" })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .catch(function (e) { delete cache[href]; throw e; });
    }
    return cache[href];
  }
  function sinAncla(u) { var x = new URL(u, location.href); x.hash = ""; return x.href; }

  function marcarMenu() {
    var p = main().getAttribute("data-pagina");
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      if (a.getAttribute("data-nav") === p && !a.classList.contains("brand")) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  var navegando = 0;
  function irA(href, empujar, y) {
    var url = new URL(href, location.href);
    var id = ++navegando;
    if (carga) { carga.classList.remove("fin"); carga.classList.add("on"); }
    traer(sinAncla(url.href)).then(function (html) {
      if (id !== navegando) return;                       // se pulsó otro enlace entretanto
      var doc = new DOMParser().parseFromString(html, "text/html");
      var nuevo = doc.querySelector("main");
      if (!nuevo) { location.href = url.href; return; }
      if (empujar) {
        try { history.replaceState({ y: window.scrollY }, ""); } catch (e) {}
        history.pushState({ y: 0 }, "", url.href);
      }
      var cambiar = function () {
        var viejo = main();
        var heroV = viejo.querySelector("#hero-video"); if (heroV) heroV.pause();
        viejo.replaceWith(document.importNode(nuevo, true));
        var can = document.querySelector('link[rel="canonical"]'), cn = doc.querySelector('link[rel="canonical"]');
        if (can && cn) can.href = cn.href;
        var og = document.querySelector('meta[property="og:url"]'), ogn = doc.querySelector('meta[property="og:url"]');
        if (og && ogn) og.content = ogn.content;
        iniciarModulo();
        aplicarIdioma(actual);
        // posición: arriba, en el ancla o donde se estaba (atrás / adelante)
        var destino = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1)));
        if (destino) destino.scrollIntoView();
        else window.scrollTo(0, typeof y === "number" ? y : 0);
      };
      var vt = (document.startViewTransition && !reduce) ? document.startViewTransition(cambiar) : (cambiar(), null);
      var fin = function () {
        if (carga) { carga.classList.add("fin"); carga.classList.remove("on"); }
        // el lector de pantalla y el teclado empiezan en el título del módulo nuevo
        if (empujar) { var h = main().querySelector("h1"); if (h) h.focus({ preventScroll: true }); }
      };
      if (vt && vt.finished) vt.finished.then(fin, fin); else fin();
    }).catch(function () { location.href = url.href; });    // sin conexión o error: navegación normal
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest("a[href]");
    if (!a || a.target || a.hasAttribute("download")) return;
    var url = new URL(a.href, location.href);
    if (!esModulo(url)) return;
    // mismo módulo: un ancla la resuelve el navegador; sin ancla, se sube arriba
    if (paginaDe(url) === main().getAttribute("data-pagina")) {
      if (url.hash) return;
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      return;
    }
    e.preventDefault();
    irA(url.href, true);
  });
  window.addEventListener("popstate", function (e) {
    var url = new URL(location.href);
    if (!esModulo(url)) return;
    if (main().getAttribute("data-pagina") === paginaDe(url)) {           // solo cambió el ancla
      if (!url.hash) window.scrollTo(0, e.state && typeof e.state.y === "number" ? e.state.y : 0);
      return;
    }
    irA(location.href, false, e.state && typeof e.state.y === "number" ? e.state.y : 0);
  });
  function paginaDe(url) {
    var n = nombre(url).replace(/\.html$/, "");
    return n === "" || n === "index" ? "inicio" : n;
  }
  // se adelanta la carga del módulo al pasar el ratón o el dedo por encima
  function adelantar(e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var url = new URL(a.href, location.href);
    if (esModulo(url) && sinAncla(url.href) !== sinAncla(location.href)) traer(sinAncla(url.href)).catch(function () {});
  }
  document.addEventListener("pointerover", adelantar, { passive: true });
  document.addEventListener("focusin", adelantar);
  // enlaces de la web antigua (una sola página con anclas: #funciones, #descargar…)
  var ANTIGUAS = { "funciones": "funciones.html", "capturas": "galeria.html", "como-funciona": "guia.html#pasos",
                   "historial": "novedades.html", "preguntas": "guia.html#preguntas", "descargar": "descargar.html",
                   "aviso": "descargar.html#aviso" };
  window.addEventListener("hashchange", function () {
    var a = ANTIGUAS[location.hash.slice(1)];
    if (a && main().getAttribute("data-pagina") === "inicio") { history.replaceState(null, "", location.pathname); irA(a, true); }
  });
  try { history.replaceState({ y: window.scrollY }, ""); } catch (e) {}
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  // ================================================================ contadores
  function digitos(id, valor) {
    var el = $(id); if (!el) return;
    var min = parseInt(el.getAttribute("data-min") || "4", 10);
    var s;
    if (valor == null) { s = ""; for (var k = 0; k < min; k++) s += "-"; }
    else { s = String(Math.max(0, Math.floor(valor))); while (s.length < min) s = "0" + s; }
    el.innerHTML = s.split("").map(function (d) { return '<span class="digit">' + d + "</span>"; }).join("");
  }
  function etiqueta(id, valor) {
    var el = $(id); if (!el) return;
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", valor == null ? "—" : new Intl.NumberFormat(actual).format(valor));
  }
  function contar(id, valor, animar) {
    etiqueta(id, valor);
    if (valor == null || !animar || reduce || valor === 0) { digitos(id, valor); return; }
    var t0 = null, dur = 1100;
    function paso(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      digitos(id, Math.round(valor * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }
  var valores = { "cnt-visitas": null, "cnt-windows": null, "cnt-linux": null };
  var statsVisibles = false;
  function mostrar(id, valor) {
    valores[id] = valor;
    if (!$(id)) return;
    if (statsVisibles) contar(id, valor, true);
    else { digitos(id, null); etiqueta(id, valor); }
  }
  function iniciarContadores() {
    statsVisibles = false;
    Object.keys(valores).forEach(function (id) { digitos(id, null); etiqueta(id, valores[id]); });
    var box = document.querySelector(".stats-box");
    if (!box) return;
    var empezar = function () {
      statsVisibles = true;
      Object.keys(valores).forEach(function (id) { if (valores[id] != null) contar(id, valores[id], true); });
    };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es, obs) {
        if (!es[0].isIntersecting) return;
        obs.disconnect(); empezar();
      }, { threshold: 0.25 }).observe(box);
    } else empezar();
  }

  var ABACUS = "https://abacus.jasoncameron.dev";
  var CLAVE = "kukoxbmc-kukoscrapingfree/visitas";
  function contarVisita() {
    var ya = false;
    try { ya = sessionStorage.getItem("kuko-visita") === "1"; } catch (e) {}
    fetch(ABACUS + (ya ? "/get/" : "/hit/") + CLAVE, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) {
        if (typeof j.value !== "number") throw new Error("sin valor");
        try { sessionStorage.setItem("kuko-visita", "1"); } catch (e) {}
        mostrar("cnt-visitas", j.value);
      })
      .catch(function () {});
  }
  function contarDescargas() {
    fetch("https://api.github.com/repos/kukoxbmc/KukoScrapingFree-web/releases?per_page=100",
          { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (rels) {
        var w = 0, l = 0;
        rels.forEach(function (rel) {
          if (rel.draft) return;
          if (rel.tag_name && rel.published_at) fechasVersion[String(rel.tag_name).replace(/^v/, "")] = rel.published_at;
          if (!fecha && version && rel.tag_name === "v" + version && rel.published_at) fecha = new Date(rel.published_at);
          (rel.assets || []).forEach(function (a) {
            var n = (a.name || "").toLowerCase();
            if (!/\.zip$/.test(n)) return;              // solo los zips (no las listas de integridad)
            if (n.indexOf("-windows") >= 0) w += a.download_count || 0;
            else if (n.indexOf("-linux") >= 0) l += a.download_count || 0;
          });
        });
        mostrar("cnt-windows", w); mostrar("cnt-linux", l);
        pintarTodo(false);
      })
      .catch(function () {});
  }

  // ================================================================ versión, descargas e historial
  var version = null, fecha = null, info = null, historial = null, fechasVersion = {};
  function dos(n) { return (n < 10 ? "0" : "") + n; }
  // siempre formato europeo: dd/mm/aaaa y 24 h, en la hora local de quien visita la web
  function fechaCorta(f) { f = new Date(f); return isNaN(f) ? "" : dos(f.getDate()) + "/" + dos(f.getMonth() + 1) + "/" + f.getFullYear(); }
  function mb(n) { return (n / 1048576).toFixed(0) + " MB"; }
  function sistema() {
    var p = ((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "") + " " + navigator.userAgent;
    if (/android|iphone|ipad|cros/i.test(p)) return "";
    if (/win/i.test(p)) return "windows";
    if (/linux|x11/i.test(p)) return "linux";
    return "";
  }

  function pintarTodo(animar) {
    var t = tx();
    // descargas (etiquetas accesibles al cambiar de idioma)
    Object.keys(valores).forEach(function (id) { etiqueta(id, valores[id]); });
    if (version) {
      texto("dl-ver", (t.dl_version || "v{v}").replace("{v}", version));
      texto("foot-ver", "v" + version);
      if (fecha && !isNaN(fecha)) {
        var d = fechaCorta(fecha), h = dos(fecha.getHours()) + ":" + dos(fecha.getMinutes());
        if (texto("ver-text", t.ver_line.replace("{v}", version).replace("{d}", d).replace("{t}", h))) $("ver-line").hidden = false;
        texto("news-meta", (t.news_meta || "v{v}").replace("{v}", version).replace("{d}", d));
      }
      var base2 = "https://github.com/kukoxbmc/KukoScrapingFree-web/releases/download/v" + version + "/KukoScrapingFree-" + version;
      if ($("dl-win")) $("dl-win").href = base2 + "-windows.zip";
      if ($("dl-linux")) $("dl-linux").href = base2 + "-linux.zip";
      if (info && info.tamano) {
        if (info.tamano.windows) {
          texto("size-win", t.dl_size.replace("{size}", mb(info.tamano.windows)) + " · v" + version);
          texto("dl-meta", "v" + version + " · Windows " + mb(info.tamano.windows) + " · Linux " + mb(info.tamano.linux || 0));
        }
        if (info.tamano.linux) texto("size-linux", t.dl_size.replace("{size}", mb(info.tamano.linux)) + " · v" + version);
      }
      if (info && info.sha256) {
        [["windows", "sha-win"], ["linux", "sha-linux"]].forEach(function (x) {
          var box = $(x[1]), h = info.sha256[x[0]];
          if (!box || !h) return;
          var c = box.querySelector("code"); c.textContent = h; c.title = h;
          box.hidden = false;
        });
      }
    }
    var so = sistema();
    ["windows", "linux"].forEach(function (s) {
      var c = $("os-" + s); if (!c) return;
      c.classList.toggle("rec", s === so);
      c.querySelector(".os-rec").hidden = s !== so;
    });
    pintarHistorial();
  }

  function pintarHistorial() {
    if (!historial || !historial.length) return;
    var t = tx();
    // adelanto en la portada: las novedades de la última versión
    var tz = $("news-teaser");
    if (tz) {
      tz.textContent = "";
      var ult = historial[0], notas0 = (ult.novedades && (ult.novedades[actual] || ult.novedades.es)) || [];
      notas0.slice(0, 2).forEach(function (n) {
        var li = document.createElement("li");
        li.textContent = n.length > 110 ? n.slice(0, 107).replace(/\s+\S*$/, "") + "…" : n;
        tz.appendChild(li);
      });
    }
    var box = $("hist-list");
    if (!box) return;
    texto("hist-cur", "v" + (version || historial[0].version));
    texto("hist-n", String(historial.length));
    var abiertas = {}, primera = !box.querySelector("details");
    box.querySelectorAll("details[open]").forEach(function (d) { abiertas[d.getAttribute("data-v")] = true; });
    box.textContent = "";
    historial.forEach(function (h, i) {
      var notas = (h.novedades && (h.novedades[actual] || h.novedades.es)) || [];
      if (!notas.length) return;
      var d = document.createElement("details");
      d.className = "ver" + (i === 0 ? " latest" : "");
      d.setAttribute("data-v", h.version);
      if ((primera && i < 2) || abiertas[h.version]) d.open = true;      // las dos más recientes, desplegadas
      var sm = document.createElement("summary");
      var num = document.createElement("span"); num.className = "ver-num"; num.textContent = "v" + h.version;
      sm.appendChild(num);
      if (i === 0) { var tg = document.createElement("span"); tg.className = "ver-tag"; tg.textContent = t.hist_latest; sm.appendChild(tg); }
      var iso = fechasVersion[h.version];
      if (iso) { var fe = document.createElement("span"); fe.className = "ver-date"; fe.textContent = t.hist_published.replace("{d}", fechaCorta(iso)); sm.appendChild(fe); }
      d.appendChild(sm);
      var ul = document.createElement("ul");
      notas.forEach(function (n) { var li = document.createElement("li"); li.textContent = n; ul.appendChild(li); });
      d.appendChild(ul);
      box.appendChild(d);
    });
    var dev = document.createElement("p"); dev.className = "hist-dev"; dev.textContent = t.hist_dev; box.appendChild(dev);
    filtrarHistorial();
  }
  function leerHistorial() {
    fetch("historial.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { if (Array.isArray(j)) { historial = j; pintarHistorial(); } })
      .catch(function () {
        if (info && Array.isArray(info.historial)) { historial = info.historial; pintarHistorial(); }
      });
  }
  function leerVersion() {
    fetch("version.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) {
        if (!j.version || !/^[0-9][0-9.]*$/.test(j.version)) return;
        info = j; version = j.version;
        if (j.fecha) fecha = new Date(j.fecha);
        if (!historial && Array.isArray(j.historial)) historial = j.historial;
        pintarTodo(false);
      })
      .catch(function () {});
  }

  // ================================================================ buscadores (preguntas y novedades)
  function normal(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function coincide(texto, q) {
    if (!q) return true;
    var n = normal(texto);
    return normal(q).split(/\s+/).filter(Boolean).every(function (w) { return n.indexOf(w) >= 0; });
  }
  function filtrarFaq() {
    var inp = $("faq-q"), faq = $("faq"); if (!inp || !faq) return;
    var q = inp.value.trim(), n = 0;
    faq.querySelectorAll("details").forEach(function (d) {
      var ok = coincide(d.textContent, q);
      d.hidden = !ok; if (ok) n++;
      if (q && ok) d.open = true;
    });
    $("faq-none").hidden = n > 0;
  }
  function filtrarHistorial() {
    var inp = $("hist-q"), box = $("hist-list"); if (!inp || !box) return;
    var q = inp.value.trim(), n = 0;
    box.querySelectorAll("details").forEach(function (d) {
      var ok = coincide(d.textContent, q);
      d.hidden = !ok; if (ok) n++;
      if (q && ok) d.open = true;
    });
    if ($("hist-none")) $("hist-none").hidden = n > 0 || !box.querySelector("details");
  }

  // ================================================================ pestañas (galería)
  function iniciarPestanas() {
    document.querySelectorAll("[data-tabs]").forEach(function (w) {
      var lista = w.querySelector("[role=tablist]"); if (!lista) return;
      var tabs = Array.prototype.slice.call(lista.querySelectorAll("[role=tab]"));
      w.classList.add("js-tabs");
      lista.hidden = false;
      function elegir(tab, foco) {
        tabs.forEach(function (b) {
          var si = b === tab;
          b.setAttribute("aria-selected", si ? "true" : "false");
          b.tabIndex = si ? 0 : -1;
          $(b.getAttribute("aria-controls")).hidden = !si;
        });
        if (foco) tab.focus();
      }
      tabs.forEach(function (b, i) {
        b.addEventListener("click", function () { elegir(b, false); });
        b.addEventListener("keydown", function (e) {
          var j = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : null;
          if (j === null) return;
          e.preventDefault(); elegir(tabs[(j + tabs.length) % tabs.length], true);
        });
      });
      elegir(tabs.filter(function (b) { return b.getAttribute("aria-selected") === "true"; })[0] || tabs[0], false);
    });
  }

  // ================================================================ galería y vídeo (delegados: valen para cualquier módulo)
  var lb = $("lb"), fotos = [], idx = 0;
  function verFoto(i) {
    idx = (i + fotos.length) % fotos.length;
    var b = fotos[idx], img = b.querySelector("img");
    $("lb-img").src = b.getAttribute("data-lb");
    $("lb-img").alt = img ? img.alt : "";
    $("lb-cap").textContent = img ? img.alt : "";
  }
  function abrirDialogo(d) { if (d.showModal) d.showModal(); else d.setAttribute("open", ""); }
  function cerrarDialogo(d) { if (d.close) d.close(); else d.removeAttribute("open"); }
  var vd = $("vd"), vdv = $("vd-video");
  document.addEventListener("click", function (e) {
    var f = e.target.closest("[data-lb]");
    if (f) {
      fotos = Array.prototype.slice.call(main().querySelectorAll("[data-lb]"));
      verFoto(fotos.indexOf(f)); abrirDialogo(lb); return;
    }
    var v = e.target.closest("[data-video]");
    if (v) {
      abrirDialogo(vd);
      var hv = $("hero-video"); if (hv) hv.pause();
      try { vdv.currentTime = 0; var p = vdv.play(); if (p && p.catch) p.catch(function () {}); } catch (er) {}
      return;
    }
    var c = e.target.closest("[data-copy]");
    if (c) {
      var code = c.parentNode.querySelector("code"); if (!code) return;
      var ok = function () {
        c.textContent = tx().dl_copied || "✓";
        setTimeout(function () { c.textContent = tx().dl_copy; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code.textContent).then(ok, function () {});
      else { var r = document.createRange(); r.selectNodeContents(code); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    }
  });
  $("lb-prev").addEventListener("click", function () { verFoto(idx - 1); });
  $("lb-next").addEventListener("click", function () { verFoto(idx + 1); });
  $("lb-close").addEventListener("click", function () { cerrarDialogo(lb); });
  lb.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") verFoto(idx - 1);
    else if (e.key === "ArrowRight") verFoto(idx + 1);
  });
  lb.addEventListener("click", function (e) { if (e.target === lb) cerrarDialogo(lb); });
  function cerrarVideo() { vdv.pause(); cerrarDialogo(vd); }
  $("vd-close").addEventListener("click", cerrarVideo);
  vd.addEventListener("close", function () {
    vdv.pause();
    var hv = $("hero-video");
    if (hv && !reduce) { var p = hv.play(); if (p && p.catch) p.catch(function () {}); }
  });
  vd.addEventListener("click", function (e) { if (e.target === vd) cerrarVideo(); });

  // ================================================================ aparecer al bajar
  var obs = null;
  function iniciarAparecer() {
    if (reduce || !("IntersectionObserver" in window)) return;
    if (obs) obs.disconnect();
    var vh = window.innerHeight || 800;
    obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("rv-in");
        e.target.classList.remove("rv-wait");
        obs.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    main().querySelectorAll(".rv").forEach(function (el, i) {
      if (el.getBoundingClientRect().top < vh) return;      // lo de la primera pantalla, visible ya
      el.classList.add("rv-wait");
      el.style.transitionDelay = ((i % 3) * 70) + "ms";
      obs.observe(el);
    });
  }

  // ================================================================ lo propio de cada módulo
  function iniciarModulo() {
    marcarMenu();
    var cmp = $("cmp"), rango = $("cmp-range");
    if (cmp && rango) {
      var mover = function () { cmp.style.setProperty("--pos", rango.value + "%"); };
      rango.addEventListener("input", mover); mover();
    }
    var hv = $("hero-video");
    if (hv && reduce) { hv.removeAttribute("autoplay"); hv.pause(); }
    else if (hv) { var p = hv.play(); if (p && p.catch) p.catch(function () {}); }
    iniciarPestanas();
    document.querySelectorAll("[data-search-box]").forEach(function (b) { b.hidden = false; });
    if ($("faq-q")) $("faq-q").addEventListener("input", filtrarFaq);
    if ($("hist-q")) $("hist-q").addEventListener("input", filtrarHistorial);
    if ($("hist-open")) $("hist-open").addEventListener("click", function () { $("hist-list").querySelectorAll("details:not([hidden])").forEach(function (d) { d.open = true; }); });
    if ($("hist-close")) $("hist-close").addEventListener("click", function () { $("hist-list").querySelectorAll("details").forEach(function (d) { d.open = false; }); });
    iniciarContadores();
    iniciarAparecer();
  }

  // ================================================================ arranque
  iniciarModulo();
  aplicarIdioma(idiomaInicial());
  leerVersion();
  leerHistorial();
  contarVisita();
  contarDescargas();
})();
