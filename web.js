/* KukoScrapingFree — web: idioma, tema, contadores, versión y novedades, antes/después,
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
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    if (t.meta_title) document.title = t.meta_title;
    var setMeta = function (sel, val) { var m = document.querySelector(sel); if (m && val) m.setAttribute("content", val); };
    setMeta('meta[name="description"]', t.meta_desc);
    setMeta('meta[property="og:title"]', t.meta_title);
    setMeta('meta[property="og:description"]', t.meta_desc);
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
    $("lang-flag").innerHTML = bandera(actual);
    $("lang-name").textContent = info.name;
    document.querySelectorAll("#lang-menu button").forEach(function (b) {
      b.setAttribute("aria-checked", b.getAttribute("data-code") === actual ? "true" : "false");
    });
    pintarDescargas(false);
    pintarVersion();
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
    root.setAttribute("data-theme", nuevo);
    guardar("kuko-tema", nuevo);
    pintarTema();
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
  // los números «suben» hasta su valor la primera vez que se ven
  function contar(id, valor, animar) {
    etiqueta(id, valor);
    if (valor == null || !animar || reduce || valor === 0) { digitos(id, valor); return; }
    var t0 = null, dur = 1100;
    function paso(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      digitos(id, Math.round(valor * e));
      if (p < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }
  var statsVisibles = false;
  var pendientes = {};
  function mostrar(id, valor) {
    if (statsVisibles) contar(id, valor, true);
    else { pendientes[id] = valor; digitos(id, null); etiqueta(id, valor); }
  }
  var statsBox = document.querySelector(".stats-box");
  if ("IntersectionObserver" in window && statsBox) {
    new IntersectionObserver(function (es, obs) {
      if (!es[0].isIntersecting) return;
      statsVisibles = true; obs.disconnect();
      Object.keys(pendientes).forEach(function (id) { contar(id, pendientes[id], true); });
    }, { threshold: 0.25 }).observe(statsBox);
  } else { statsVisibles = true; }

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
      .catch(function () { digitos("cnt-visitas", null); etiqueta("cnt-visitas", null); });
  }

  var descargas = { win: null, linux: null };
  function pintarDescargas(animar) {
    if (animar) { mostrar("cnt-windows", descargas.win); mostrar("cnt-linux", descargas.linux); }
    else { etiqueta("cnt-windows", descargas.win); etiqueta("cnt-linux", descargas.linux); }   // solo el texto accesible
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
          if (!fecha && version && rel.tag_name === "v" + version && rel.published_at) {
            fecha = new Date(rel.published_at); pintarVersion();
          }
          (rel.assets || []).forEach(function (a) {
            var n = (a.name || "").toLowerCase();
            if (n.indexOf("-windows") >= 0) w += a.download_count || 0;
            else if (n.indexOf("-linux") >= 0) l += a.download_count || 0;
          });
        });
        descargas.win = w; descargas.linux = l;
        pintarDescargas(true);
        pintarHistorial();
      })
      .catch(function () {});
  }

  // ================================================================ versión, tamaños y novedades
  var version = null, fecha = null, info = null;
  function dos(n) { return (n < 10 ? "0" : "") + n; }
  function mb(n) {
    var v = (n / 1048576).toFixed(0);
    return v + " MB";
  }
  function pintarVersion() {
    if (!version) return;
    var t = tx();
    $("dl-ver").textContent = (t.dl_version || "v{v}").replace("{v}", version);
    if (fecha && !isNaN(fecha)) {
      // formato europeo siempre: dd/mm/aaaa y 24 h, en la hora local de quien visita la web
      var d = dos(fecha.getDate()) + "/" + dos(fecha.getMonth() + 1) + "/" + fecha.getFullYear();
      var h = dos(fecha.getHours()) + ":" + dos(fecha.getMinutes());
      $("ver-text").textContent = t.ver_line.replace("{v}", version).replace("{d}", d).replace("{t}", h);
      $("ver-line").hidden = false;
    }
    if (info && info.tamano) {
      if (info.tamano.windows) $("size-win").textContent = t.dl_size.replace("{size}", mb(info.tamano.windows)) + " · v" + version;
      if (info.tamano.linux) $("size-linux").textContent = t.dl_size.replace("{size}", mb(info.tamano.linux)) + " · v" + version;
    }
    pintarHistorial();
  }

  // ================================================================ historial de versiones
  // historial.json lo publica la compilación con cada versión; las fechas salen de GitHub
  var historial = null, fechasVersion = {};
  function fechaCorta(iso) {
    var f = new Date(iso);
    if (isNaN(f)) return "";
    return dos(f.getDate()) + "/" + dos(f.getMonth() + 1) + "/" + f.getFullYear();   // siempre europeo
  }
  function pintarHistorial() {
    if (!historial || !historial.length) return;
    var t = tx(), box = $("hist-list");
    var abiertas = {};
    box.querySelectorAll("details[open]").forEach(function (d) { abiertas[d.getAttribute("data-v")] = true; });
    box.textContent = "";
    historial.forEach(function (h, i) {
      var notas = (h.novedades && (h.novedades[actual] || h.novedades.es)) || [];
      if (!notas.length) return;
      var d = document.createElement("details");
      d.className = "ver" + (i === 0 ? " latest" : "");
      d.setAttribute("data-v", h.version);
      if (i < 2 || abiertas[h.version]) d.open = true;      // las dos más recientes, desplegadas
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
    $("historial").hidden = false;
  }
  function leerHistorial() {
    fetch("historial.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { if (Array.isArray(j)) { historial = j; pintarHistorial(); } })
      .catch(function () {
        // sin historial.json todavía: al menos el de version.json (últimas versiones)
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
        var base = "https://github.com/kukoxbmc/KukoScrapingFree-web/releases/download/v" + version + "/KukoScrapingFree-" + version;
        $("dl-win").href = base + "-windows.zip";
        $("dl-linux").href = base + "-linux.zip";
        pintarVersion();
      })
      .catch(function () {});
  }

  // ================================================================ antes / después
  var cmp = $("cmp"), rango = $("cmp-range");
  if (cmp && rango) {
    var mover = function () { cmp.style.setProperty("--pos", rango.value + "%"); };
    rango.addEventListener("input", mover);
    mover();
  }

  // ================================================================ galería
  var lb = $("lb"), fotos = Array.prototype.slice.call(document.querySelectorAll("[data-lb]")), idx = 0;
  function verFoto(i) {
    idx = (i + fotos.length) % fotos.length;
    var b = fotos[idx], img = b.querySelector("img");
    $("lb-img").src = b.getAttribute("data-lb");
    $("lb-img").alt = img ? img.alt : "";
    $("lb-cap").textContent = img ? img.alt : "";
  }
  function abrirDialogo(d) { if (d.showModal) d.showModal(); else d.setAttribute("open", ""); }
  function cerrarDialogo(d) { if (d.close) d.close(); else d.removeAttribute("open"); }
  fotos.forEach(function (b, i) { b.addEventListener("click", function () { verFoto(i); abrirDialogo(lb); }); });
  $("lb-prev").addEventListener("click", function () { verFoto(idx - 1); });
  $("lb-next").addEventListener("click", function () { verFoto(idx + 1); });
  $("lb-close").addEventListener("click", function () { cerrarDialogo(lb); });
  lb.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") verFoto(idx - 1);
    else if (e.key === "ArrowRight") verFoto(idx + 1);
  });
  lb.addEventListener("click", function (e) { if (e.target === lb) cerrarDialogo(lb); });

  // ================================================================ vídeo
  var vd = $("vd"), vdv = $("vd-video"), heroV = $("hero-video");
  document.querySelectorAll("[data-video]").forEach(function (b) {
    b.addEventListener("click", function () {
      abrirDialogo(vd);
      if (heroV) heroV.pause();
      try { vdv.currentTime = 0; var p = vdv.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    });
  });
  function cerrarVideo() { vdv.pause(); cerrarDialogo(vd); }
  $("vd-close").addEventListener("click", cerrarVideo);
  vd.addEventListener("close", function () { vdv.pause(); if (heroV && !reduce) { var p = heroV.play(); if (p && p.catch) p.catch(function () {}); } });
  vd.addEventListener("click", function (e) { if (e.target === vd) cerrarVideo(); });
  if (heroV && reduce) { heroV.removeAttribute("autoplay"); heroV.pause(); }

  // ================================================================ aparecer al bajar
  // Solo lo que está por debajo de la primera pantalla; si algo falla, todo queda visible.
  if (!reduce && "IntersectionObserver" in window) {
    var vh = window.innerHeight || 800;
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("rv-in");
        e.target.classList.remove("rv-wait");
        obs.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".rv").forEach(function (el, i) {
      if (el.getBoundingClientRect().top < vh) return;
      el.classList.add("rv-wait");
      el.style.transitionDelay = ((i % 3) * 70) + "ms";
      obs.observe(el);
    });
  }

  // ================================================================ arranque
  aplicarIdioma(idiomaInicial());
  digitos("cnt-visitas", null); digitos("cnt-windows", null); digitos("cnt-linux", null);
  leerVersion();
  leerHistorial();
  contarVisita();
  contarDescargas();
})();
