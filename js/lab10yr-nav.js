/* lab10yr-nav.js — injects the shared Lab10YR app launcher on every page.
   Cross-links the public apps so no page is an orphan. Pure vanilla, no deps;
   include with <script src="js/lab10yr-nav.js" defer></script>. Paths are
   relative + .html so they resolve on both the staging Pages subpath and the
   production worker (which also serves .html). */
(function () {
  var APPS = [
    { h: "soil-atlas.html",            t: "Soil Atlas",        i: "◉" },
    { h: "carbon-risk-map.html",       t: "Carbon Risk Map",   i: "◈" },
    { h: "soil-data-stories.html",     t: "Data Stories",      i: "✎" },
    { h: "county-report.html",         t: "County Report",     i: "▤" },
    { h: "county-risk-leaderboard.html", t: "Risk Leaderboard", i: "☰" },
    { h: "data-center-app.html",       t: "Data Center DCI",   i: "◆" },
    { h: "soil-risk-explorer.html",    t: "Soil Risk Explorer", i: "◇" },
    { sep: true, hd: "Business" },
    { h: "services.html",              t: "Services",          i: "→" },
    { h: "dci-pricing.html",           t: "Pricing & API",     i: "$" },
    { h: "about.html",                 t: "About",             i: "ℹ" }
  ];
  var here = (location.pathname.split("/").pop() || "soil-atlas.html").toLowerCase();

  function build() {
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
    var html = '<div class="l10-hd">Explore</div>';
    APPS.forEach(function (a) {
      if (a.sep) { html += '<div class="l10-sep"></div><div class="l10-hd">' + a.hd + "</div>"; return; }
      var cur = a.h.toLowerCase() === here ? " cur" : "";
      html += '<a class="' + "" + cur.trim() + '" role="menuitem" href="' + a.h + '">' +
              '<span class="l10-i">' + a.i + "</span>" + a.t + "</a>";
    });
    menu.innerHTML = html;

    function toggle(open) {
      var o = open === undefined ? !menu.classList.contains("open") : open;
      menu.classList.toggle("open", o);
      btn.setAttribute("aria-expanded", String(o));
    }
    btn.addEventListener("click", function (e) { e.stopPropagation(); toggle(); });
    document.addEventListener("click", function () { toggle(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") toggle(false); });
    menu.addEventListener("click", function (e) { e.stopPropagation(); });

    wrap.appendChild(btn);
    wrap.appendChild(menu);
    document.body.appendChild(wrap);

    fixLauncher();
    window.addEventListener("resize", fixLauncher);
    // some apps build their top bar from deferred scripts that run after us
    setTimeout(fixLauncher, 400);
    setTimeout(fixLauncher, 1400);
  }

  // The launcher is position:fixed at the top-right (see .l10-launch in
  // lab10yr-theme.css). Some apps (e.g. the GroundScore DCI app) have a fixed
  // full-width top bar whose right-aligned controls were laid out without
  // leaving room for the launcher, so it covers them (z 99999 > the bar).
  // Reserve room by padding the bar's right edge so its controls clear the
  // launcher and it stays in the header row. Pure layout, idempotent, and a
  // no-op for apps whose header already leaves space (overflow:auto bars that
  // clip+scroll, or non-full-width bars) — we deliberately don't touch those.
  function fixLauncher() {
    var wrap = document.querySelector(".l10-launch");
    if (!wrap) return;
    var lw = wrap.offsetWidth;
    if (!lw) return;
    var vw = document.documentElement.clientWidth;
    var launcherLeft = vw - 12 - lw;   // CSS pins the launcher at right:12
    var need = Math.ceil(lw + 26);     // launcher width + breathing room

    var nodes = document.body.getElementsByTagName("*");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el === wrap || wrap.contains(el)) continue;
      var cs = getComputedStyle(el);
      if (cs.position !== "fixed" && cs.position !== "sticky") continue;
      if (el.scrollWidth > el.clientWidth + 2) continue; // bar already scrolls its own content: leave it
      var r = el.getBoundingClientRect();
      if (r.top > 6 || r.height > 96 || r.width < vw * 0.55) continue;    // top bars only
      if (r.right < launcherLeft - 4) continue;                           // already clears the launcher
      if (parseFloat(cs.paddingRight) >= need) continue;                  // already reserved
      el.style.paddingRight = need + "px";
    }
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", build);
  else build();
})();
