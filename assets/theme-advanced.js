// Advanced theme and UX JS for all docs pages
(function () {
  // Theme is dark-only across the docs site.
  const themeBtn = document.getElementById("themeToggleBtn");
  const densityBtn = document.getElementById("densityToggleBtn");
  const root = document.documentElement;
  const THEME_KEY = "nrcs-theme";
  const DENSITY_KEY = "nrcs-density";

  function setTheme() {
    root.dataset.theme = "dark";
    localStorage.setItem(THEME_KEY, "dark");
    if (themeBtn) {
      themeBtn.textContent = "Theme: Dark";
      themeBtn.style.display = "none";
    }
  }
  function setDensity(mode) {
    document.body.classList.toggle("compact", mode === "compact");
    if (densityBtn)
      densityBtn.textContent = `Density: ${mode === "compact" ? "Compact" : "Comfortable"}`;
    localStorage.setItem(DENSITY_KEY, mode);
  }
  if (densityBtn)
    densityBtn.onclick = function () {
      setDensity(
        document.body.classList.contains("compact") ? "comfortable" : "compact",
      );
    };

  // Load prefs
  setTheme();
  setDensity(localStorage.getItem(DENSITY_KEY) || "comfortable");

  // Back to top FAB
  const fab = document.getElementById("backToTopFab");
  if (fab) {
    window.addEventListener("scroll", function () {
      fab.classList.toggle("show", window.scrollY > 280);
    });
    fab.onclick = function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  }

  // Keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const search = document.querySelector(
        "input[type=search], input[type=text].filter-input",
      );
      if (search) {
        search.focus();
        e.preventDefault();
      }
    }
    if (e.key === "t" && e.ctrlKey) {
      e.preventDefault();
    }
  });

  // Dynamic year
  const yearNodes = document.querySelectorAll("[data-year]");
  const year = new Date().getFullYear();
  yearNodes.forEach((node) => {
    node.textContent = String(year);
  });

  // Reveal-on-scroll for editorial cards
  const revealNodes = document.querySelectorAll(".reveal");
  if (revealNodes.length > 0 && "IntersectionObserver" in globalThis) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );
    revealNodes.forEach((node) => observer.observe(node));
  }

  // Subtle parallax on hero map stage
  const parallaxNodes = document.querySelectorAll("[data-parallax]");
  if (parallaxNodes.length > 0) {
    let ticking = false;
    const updateParallax = function () {
      const y = globalThis.scrollY || 0;
      parallaxNodes.forEach((node) => {
        const speed = Number(node.dataset.parallax || "0");
        node.style.transform = `translate3d(0, ${Math.round(y * speed)}px, 0)`;
      });
      ticking = false;
    };
    globalThis.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateParallax);
        }
      },
      { passive: true },
    );
    updateParallax();
  }

  // Sticky scrollytelling annotation syncing
  const scrollySteps = document.querySelectorAll(".scrolly-step[data-step]");
  const annotationItems = document.querySelectorAll(
    ".annotation-item[data-step]",
  );
  if (
    scrollySteps.length > 0 &&
    annotationItems.length > 0 &&
    "IntersectionObserver" in globalThis
  ) {
    const activateStep = function (stepId) {
      annotationItems.forEach((item) => {
        item.classList.toggle("is-active", item.dataset.step === stepId);
      });
    };
    const scrollyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activateStep(entry.target.dataset.step || "");
          }
        });
      },
      { root: null, rootMargin: "-35% 0px -45% 0px", threshold: 0.01 },
    );
    scrollySteps.forEach((step) => scrollyObserver.observe(step));
  }

  // Lightweight count-up animation for headline metrics
  const counters = document.querySelectorAll("[data-count-to]");
  counters.forEach((counter) => {
    const target = Number(counter.dataset.countTo || "0");
    if (!Number.isFinite(target) || target <= 0) return;
    const duration = 1100;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  // Badge bar (static links, avoid stale/fake status text)
  const badgeBar = document.getElementById("badgeBar");
  if (badgeBar) {
    badgeBar.innerHTML = `
      <span class="badge status-unknown">Workflow badges live in README</span>
      <a class="badge status-pass" href="https://github.com/jneme910/NRCS-Soil-Data-Access/actions" target="_blank" rel="noopener">Open Actions</a>
    `;
  }

  async function loadSqlIndex() {
    const candidates = [
      "data/sql-index.json",
      "docs/data/sql-index.json",
      "../docs/data/sql-index.json",
    ];

    for (const path of candidates) {
      try {
        const response = await fetch(path, { cache: "no-store" });
        if (!response.ok) continue;
        const payload = await response.json();
        if (payload && Array.isArray(payload.scripts)) {
          return payload.scripts;
        }
      } catch {
        // Try next candidate.
      }
    }

    return [];
  }

  function svgText(x, y, text, fill, size, anchor) {
    return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" text-anchor="${anchor}" font-family="Libre Franklin, Segoe UI, sans-serif">${text}</text>`;
  }

  function renderCategoryBars(data) {
    const width = 520;
    const height = 232;
    const margin = { top: 18, right: 14, bottom: 22, left: 180 };
    const chartWidth = width - margin.left - margin.right;
    const barGap = 11;
    const barHeight = Math.max(
      10,
      Math.floor(
        (height - margin.top - margin.bottom - barGap * (data.length - 1)) /
          data.length,
      ),
    );
    const maxValue = Math.max(...data.map((d) => d.value), 1);

    let body = `<rect x="0" y="0" width="${width}" height="${height}" fill="transparent" />`;

    data.forEach((d, i) => {
      const y = margin.top + i * (barHeight + barGap);
      const w = Math.max(4, (d.value / maxValue) * chartWidth);
      body += `<rect x="${margin.left}" y="${y}" width="${w}" height="${barHeight}" rx="4" fill="${i < 3 ? "#79d39f" : "#5ea6e1"}" opacity="0.9"/>`;
      body += svgText(
        margin.left - 8,
        y + barHeight - 2,
        d.label,
        "#c7dbf0",
        "11",
        "end",
      );
      body += svgText(
        margin.left + w + 8,
        y + barHeight - 2,
        String(d.value),
        "#f0f7ff",
        "11",
        "start",
      );
    });

    return `<svg viewBox="0 0 ${width} ${height}" aria-label="SQL categories bar chart">${body}</svg>`;
  }

  function renderTagLollipops(data) {
    const width = 520;
    const height = 232;
    const margin = { top: 22, right: 18, bottom: 46, left: 18 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const step = chartWidth / Math.max(data.length - 1, 1);

    let body = `<rect x="0" y="0" width="${width}" height="${height}" fill="transparent" />`;
    body += `<line x1="${margin.left}" y1="${margin.top + chartHeight}" x2="${margin.left + chartWidth}" y2="${margin.top + chartHeight}" stroke="rgba(149, 180, 211, 0.4)" stroke-width="1"/>`;

    data.forEach((d, i) => {
      const x = margin.left + i * step;
      const y =
        margin.top + chartHeight - (d.value / maxValue) * (chartHeight - 8);
      body += `<line x1="${x}" y1="${margin.top + chartHeight}" x2="${x}" y2="${y}" stroke="rgba(122, 201, 255, 0.55)" stroke-width="2"/>`;
      body += `<circle cx="${x}" cy="${y}" r="5" fill="#f1ab6c" stroke="#ffe2c8" stroke-width="1"/>`;
      body += svgText(
        x,
        height - 14,
        d.displayLabel || d.label,
        "#c7dbf0",
        "10",
        "middle",
      );
      body += svgText(x, y - 8, String(d.value), "#f4fbff", "10", "middle");
    });

    return `<svg viewBox="0 0 ${width} ${height}" aria-label="Top tags lollipop chart">${body}</svg>`;
  }

  function renderYearTrend(data) {
    const width = 1050;
    const height = 86;
    const margin = { top: 10, right: 12, bottom: 20, left: 16 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const step = chartWidth / Math.max(data.length - 1, 1);

    const points = data.map((d, i) => {
      const x = margin.left + i * step;
      const y = margin.top + chartHeight - (d.value / maxValue) * chartHeight;
      return { x, y, label: d.label, value: d.value };
    });

    const path = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
      .join(" ");
    let body = `<path d="${path}" fill="none" stroke="#78c7f5" stroke-width="2.4"/>`;

    points.forEach((p, i) => {
      body += `<circle cx="${p.x}" cy="${p.y}" r="3" fill="#ffd08b"/>`;
      if (
        i === 0 ||
        i === points.length - 1 ||
        data.length <= 6 ||
        i % 2 === 0
      ) {
        body += svgText(p.x, height - 4, p.label, "#b7cee5", "10", "middle");
      }
    });

    return `<svg viewBox="0 0 ${width} ${height}" aria-label="Yearly SQL updates trend">${body}</svg>`;
  }

  function toDisplayTag(raw) {
    return String(raw || "")
      .replaceAll("-", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  async function initRepositoryHeroViz() {
    const mapStages = document.querySelectorAll(".hero-mapstage");
    if (!mapStages.length) return;

    const scripts = await loadSqlIndex();
    if (!scripts.length) return;

    const categoryCounts = new Map();
    const tagCounts = new Map();
    const yearCounts = new Map();
    const excludedTags = new Set([
      "sandbox",
      "curated",
      "documentation",
      "sda",
      "acpf",
      "general",
    ]);

    scripts.forEach((script) => {
      const category = script.category || "General Soil Data";
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);

      const tags = Array.isArray(script.tags) ? script.tags : [];
      tags.forEach((tag) => {
        const key = String(tag || "")
          .trim()
          .toLowerCase();
        if (!key || excludedTags.has(key)) return;
        tagCounts.set(key, (tagCounts.get(key) || 0) + 1);
      });

      const year = String(script.lastUpdatedUtc || "").slice(0, 4);
      if (/^\d{4}$/.test(year)) {
        yearCounts.set(year, (yearCounts.get(year) || 0) + 1);
      }
    });

    const categoryData = [...categoryCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value]) => ({ label, value }));

    const tagData = [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, value]) => ({
        label,
        displayLabel: toDisplayTag(label),
        value,
      }));

    const yearData = [...yearCounts.entries()]
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([label, value]) => ({ label, value }));

    mapStages.forEach((stage) => {
      if (stage.querySelector(".repo-viz-shell")) return;

      const shell = document.createElement("div");
      shell.className = "repo-viz-shell";

      const leftPanel = document.createElement("section");
      leftPanel.className = "repo-viz-panel";
      leftPanel.innerHTML = `<p class="repo-viz-title">Top SQL Purpose Categories</p>${renderCategoryBars(categoryData)}`;

      const rightPanel = document.createElement("section");
      rightPanel.className = "repo-viz-panel";
      rightPanel.innerHTML = `<p class="repo-viz-title">Most Frequent Tags</p>${renderTagLollipops(tagData)}`;

      const footer = document.createElement("section");
      footer.className = "repo-viz-footer";
      footer.innerHTML = yearData.length
        ? `<p class="repo-viz-title">Yearly Script Updates</p>${renderYearTrend(yearData)}`
        : `<p class="repo-viz-empty">No yearly update data available.</p>`;

      shell.append(leftPanel, rightPanel);
      stage.append(shell, footer);
    });
  }

  initRepositoryHeroViz();
})();
