/* lab10yr-nav.js — shared navigation for every Lab10YR page.
   Standardizes the top bar to the LANDING header (Lab10YR wordmark +
   Solutions / Industries / Explore / Learn / Pricing + "Get started"), so every
   page matches lab10yr.com, AND keeps the top-right "Lab10YR apps" launcher for
   quick access to the maps/tools. Pure vanilla, no deps; include with
   <script src="js/lab10yr-nav.js" defer>. */
(function () {
  // Top-level site sections (mirror of innovation-prototype components/Nav.tsx).
  // Root-absolute so they resolve from any depth (incl. /articles/*) on the
  // production worker that serves lab10yr.com at the root.
  var SITE = [
    { h: "/",            t: "Home" },
    { h: "/solutions/",  t: "Solutions" },
    { h: "/industries/", t: "Industries" },
    { h: "/explore/",    t: "Explore" },
    { h: "/learn/",      t: "Learn" },
    { h: "/pricing/",    t: "Pricing" },
    { h: "/contact/",    t: "Contact" }
  ];

  // Apps launcher contents — the complete live-app catalog (same manifest as
  // /explore/), categorized with plain-English names. Root-absolute like SITE,
  // so they resolve from any depth — relative hrefs 404'd from /articles/*
  // ("Home" went to /articles/index.html, tools to /articles/<tool>.html).
  var HOME = { h: "/index.html", t: "Home", i: "⌂" };
  var NAV = [
    { group: "Maps & scores", items: [
      { h: "/soil-atlas.html",                        t: "Soil atlas",               i: "◉" },
      { h: "/Regenerative-Agriculture-Risk-Map.html", t: "Regenerative ag risk map", i: "❧" },
      { h: "/carbon-risk-map.html",                   t: "Carbon risk map",          i: "◈" },
      { h: "/soil-risk-explorer.html",                t: "Soil risk explorer",       i: "◇" },
      { h: "/county-risk-leaderboard.html",           t: "County risk leaderboard",  i: "☰" },
      { h: "/data-center-app.html",                   t: "GroundScore DCI",          i: "◆" }
    ] },
    { group: "Reports & data", items: [
      { h: "/county-report.html",                     t: "County report",            i: "▤" },
      { h: "/wisconsin-forage-suitability-report.html", t: "Wisconsin forage report", i: "▧" },
      { h: "/analyze.html",                           t: "AOI analyzer",             i: "⊙" },
      { h: "/soil-lookup.html",                       t: "Soil lookup",              i: "⌕" },
      { h: "/interpretations.html",                   t: "Interpretations",          i: "≡" },
      { h: "/kssl-lab-data.html",                     t: "KSSL lab data",            i: "⚗" },
      { h: "/soil-application-metrics.html",          t: "Application metrics",      i: "▦" }
    ] },
    { group: "Developer tools", items: [
      { h: "/sql-explorer.html",                      t: "SQL explorer",             i: "⌗" },
      { h: "/data-models.html",                       t: "Data models",              i: "⊞" },
      { h: "/examples.html",                          t: "Query examples",           i: "❯" },
      { h: "/soil-data-visual-lab.html",              t: "Visual lab",               i: "⊿" }
    ] },
    { group: "Stories & research", items: [
      { h: "/soil-data-stories.html",                 t: "Soil data stories",        i: "✎" },
      { h: "/regen-ag-shape-curves.html",             t: "SHAPE curves",             i: "∿" },
      { h: "/articles/",                              t: "Articles",                 i: "❡" }
    ] },
    { group: "Company", items: [
      { h: "/explore/",                               t: "Explore all apps",         i: "✳" },
      { h: "/pricing/",                               t: "Pricing",                  i: "$" },
      { h: "/contact/",                               t: "Contact",                  i: "✉" },
      { h: "/about.html",                             t: "About",                    i: "ℹ" }
    ] }
  ];

  var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  function fname(h) { return (h.split("/").pop() || "index.html").toLowerCase(); }
  function isCur(h) { var f = fname(h); return f && f !== "index.html" && f === here; }
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function itemLink(it) {
    return '<a class="' + (isCur(it.h) ? "cur" : "") + '" role="menuitem" href="' +
      it.h + '"><span class="l10-i">' + it.i + "</span>" + esc(it.t) + "</a>";
  }

  // Shared inner markup of the landing header (brand + site links + CTA).
  function siteInnerHTML() {
    var bars = ["#1e1408", "#33240f", "#4d3717", "#6b4d20", "#8a6629", "#ab8232", "#cda23c", "#e6c14e"]
      .map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("");
    var links = SITE.map(function (l) { return '<a href="' + l.h + '">' + esc(l.t) + "</a>"; }).join("");
    return '<div class="l10-top-inner">' +
        '<a class="l10-brand" href="/" aria-label="Lab10YR">' +
          '<span class="l10-brand-bars" aria-hidden="true">' + bars + "</span>" +
          '<span class="l10-brand-word">Lab<span>10</span>YR</span>' +
        "</a>" +
        '<div class="l10-top-links">' + links + "</div>" +
        '<div class="l10-top-cta">' +
          '<a class="l10-getstarted" href="/contact/">Get started <span>&rarr;</span></a>' +
        "</div>" +
      "</div>";
  }

  // ── (a) Landing header — every page gets the amber site bar ────────────────
  // Pages with a legacy #nav (.nav-link) get its contents swapped in place,
  // preserving the page's own content offset. Pages without one get the bar
  // INJECTED as the first body element, with layout compensation for fixed
  // top bars, full-viewport containers, and 100vh app shells. Opt out with
  // <body data-l10-no-sitebar> (spec'd app headers, retired pages).
  function buildSiteHeader() {
    if (document.querySelector(".l10-top-inner")) return;
    var nav = document.getElementById("nav");
    if (nav && nav.querySelector(".nav-link")) {
      nav.classList.add("l10-themed");
      nav.style.overflow = "visible";
      nav.innerHTML = siteInnerHTML();
      return;
    }
    if (document.body.hasAttribute("data-l10-no-sitebar")) return;
    if (document.querySelector('meta[http-equiv="refresh" i]')) return; // redirect stub
    injectSiteBar();
  }

  // Insert the amber bar as the first in-flow element, then shift the page's
  // own pinned/viewport-sized chrome down by the bar height so nothing is
  // covered or clipped (same measured-adjustment idiom as fixLauncher below).
  function injectSiteBar() {
    var bar = document.createElement("header");
    bar.className = "l10-sitebar";
    bar.innerHTML = siteInnerHTML();
    document.body.insertBefore(bar, document.body.firstChild);
    // Class hook so a page's own CSS can offset app chrome the generic
    // rules below can't know about (e.g. data-center-app panels).
    document.body.classList.add("l10-has-sitebar");

    var vh = document.documentElement.clientHeight;
    var barH = bar.offsetHeight || 52;
    var kids = document.body.children;
    // Only a body whose Y axis is clipped can cut content off at the bottom;
    // "overflow: hidden auto" pages scroll vertically and must NOT be shortened.
    var hiddenBody = getComputedStyle(document.body).overflowY === "hidden";
    for (var i = 0; i < kids.length; i++) {
      var el = kids[i];
      if (el === bar || el.classList.contains("l10-launch")) continue;
      var cs = getComputedStyle(el);
      var r = el.getBoundingClientRect();
      if ((cs.position === "fixed" || cs.position === "sticky") && r.top <= barH && r.height < 140) {
        el.style.top = barH + "px";                      // pinned top bar → below ours
      } else if ((cs.position === "fixed" || cs.position === "absolute") &&
                 r.top <= 4 && r.height > vh * 0.7) {
        el.style.top = barH + "px";                      // full-viewport container
      } else if (hiddenBody && cs.position !== "fixed" && cs.position !== "absolute" &&
                 r.height > vh * 0.5 && r.bottom > vh) {
        // viewport-sized app shell in a clipped body — shorten by the overhang
        el.style.height = Math.round(r.height - Math.min(r.bottom - vh, barH)) + "px";
      }
    }
  }

  // ── (b) Top-right "Lab10YR apps" launcher — grouped maps/tools menu ────────
  function buildLauncher() {
    if (document.querySelector(".l10-launch")) return;
    var wrap = document.createElement("div");
    wrap.className = "l10-launch";

    var btn = document.createElement("button");
    btn.className = "l10-launch-btn";
    btn.type = "button";
    btn.setAttribute("aria-haspopup", "true");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = '<span class="l10-dot"></span>Lab10YR apps<span class="l10-caret">▼</span>';

    var menu = document.createElement("div");
    menu.className = "l10-menu";
    menu.setAttribute("role", "menu");
    var html = itemLink(HOME);
    NAV.forEach(function (g) {
      html += '<div class="l10-sep"></div><div class="l10-hd">' + esc(g.group) + "</div>";
      g.items.forEach(function (it) { html += itemLink(it); });
    });
    menu.innerHTML = html;

    function toggle(open) {
      var o = open === undefined ? !menu.classList.contains("open") : open;
      menu.classList.toggle("open", o);
      btn.setAttribute("aria-expanded", String(o));
    }
    btn.addEventListener("click", function (e) { e.stopPropagation(); toggle(); });
    menu.addEventListener("click", function (e) { e.stopPropagation(); });
    document.addEventListener("click", function () { toggle(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") toggle(false); });

    wrap.appendChild(btn);
    wrap.appendChild(menu);
    document.body.appendChild(wrap);

    fixLauncher();
    window.addEventListener("resize", fixLauncher);
    setTimeout(fixLauncher, 400);
    setTimeout(fixLauncher, 1400);
  }

  // Reserve room on any full-width top bar by shrinking it from the right
  // (margin) so its right-edge controls (incl. the landing "Get started" button)
  // clear the fixed launcher. Idempotent; a no-op for bars that already reserve.
  function fixLauncher() {
    var wrap = document.querySelector(".l10-launch");
    if (!wrap) return;
    var lw = wrap.offsetWidth;
    if (!lw) return;
    var vw = document.documentElement.clientWidth;
    var launcherLeft = vw - 12 - lw;
    var need = Math.ceil(lw + 26);

    var nodes = document.body.getElementsByTagName("*");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el === wrap || wrap.contains(el)) continue;
      var cs = getComputedStyle(el);
      if (cs.position !== "fixed" && cs.position !== "sticky") continue;
      var r = el.getBoundingClientRect();
      if (r.top > 6 || r.height > 96 || r.width < vw * 0.55) continue;
      if (r.right < launcherLeft - 4) continue;
      // The injected sitebar reserves with padding so its background stays
      // full-width (a margin exposes the page bg at the right edge on light
      // pages); legacy page bars keep the original margin approach.
      var prop = el.classList.contains("l10-sitebar") ? "paddingRight" : "marginRight";
      var reserved = parseFloat(prop === "paddingRight" ? cs.paddingRight : cs.marginRight) || 0;
      if (reserved >= need) continue;
      el.style[prop] = need + "px";
    }
  }

  function init() { buildSiteHeader(); buildLauncher(); }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
