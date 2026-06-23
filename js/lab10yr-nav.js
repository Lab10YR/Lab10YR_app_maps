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
    { h: "/solutions/",  t: "Solutions" },
    { h: "/industries/", t: "Industries" },
    { h: "/explore/",    t: "Explore" },
    { h: "/learn/",      t: "Learn" },
    { h: "/pricing/",    t: "Pricing" }
  ];

  // Apps launcher contents (the maps/tools), grouped.
  var HOME = { h: "index.html", t: "Home", i: "⌂" };
  var NAV = [
    { group: "Maps", items: [
      { h: "soil-atlas.html",                        t: "Soil Atlas",         i: "◉" },
      { h: "carbon-risk-map.html",                   t: "Carbon Risk Map",    i: "◈" },
      { h: "Regenerative-Agriculture-Risk-Map.html", t: "Regen Ag Map",       i: "❧" },
      { h: "data-center-app.html",                   t: "Data Center DCI",    i: "◆" },
      { h: "soil-risk-explorer.html",                t: "Soil Risk Explorer", i: "◇" }
    ] },
    { group: "Reports & Data", items: [
      { h: "county-report.html",                     t: "County Report",      i: "▤" },
      { h: "county-risk-leaderboard.html",           t: "Risk Leaderboard",   i: "☰" },
      { h: "data-models.html",                       t: "Data Models",        i: "⊞" },
      { h: "soil-application-metrics.html",          t: "Soil Metrics",       i: "▦" }
    ] },
    { group: "Tools", items: [
      { h: "soil-data-visual-lab.html",              t: "Visual Lab",         i: "⊿" },
      { h: "sql-explorer.html",                      t: "SQL Explorer",       i: "⌗" },
      { h: "regen-ag-shape-curves.html",             t: "SHAPE Curves",       i: "∿" },
      { h: "kssl-lab-data.html",                     t: "KSSL Lab Data",      i: "⚗" }
    ] },
    { group: "Read", items: [
      { h: "soil-data-stories.html",                 t: "Data Stories",       i: "✎" },
      { h: "articles/",                              t: "Articles",           i: "❡" }
    ] },
    { group: "Company", items: [
      { h: "services.html",                          t: "Services",           i: "→" },
      { h: "dci-pricing.html",                       t: "Pricing & API",      i: "$" },
      { h: "about.html",                             t: "About",              i: "ℹ" }
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

  // ── (a) Landing header — replaces each page's legacy #nav contents in place ─
  // Keeping the existing #nav element preserves the page's content offset; we
  // only swap its contents + theme class so layout below the bar stays correct.
  function buildSiteHeader() {
    var nav = document.getElementById("nav");
    if (!nav || !nav.querySelector(".nav-link") || nav.querySelector(".l10-top-inner")) return;

    var bars = ["#1e1408", "#33240f", "#4d3717", "#6b4d20", "#8a6629", "#ab8232", "#cda23c", "#e6c14e"]
      .map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("");
    var links = SITE.map(function (l) { return '<a href="' + l.h + '">' + esc(l.t) + "</a>"; }).join("");

    nav.classList.add("l10-themed");
    nav.style.overflow = "visible";
    nav.innerHTML =
      '<div class="l10-top-inner">' +
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
      var reserved = parseFloat(cs.marginRight) || 0;
      if (reserved >= need) continue;
      el.style.marginRight = need + "px";
    }
  }

  function init() { buildSiteHeader(); buildLauncher(); }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
