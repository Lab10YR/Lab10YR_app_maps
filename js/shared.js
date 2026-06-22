/**
 * Soil Intelligence — Shared Utilities
 * Include on every page: <script src="js/shared.js"></script>
 *
 * Exports (on window):
 *   SoilLog         — leveled logger with timestamps
 *   sdaPost(q,opts) — SDA API wrapper with retry + timing
 *   sdaHasRows(d,n) — safe row-count check
 *   sdaParseRows(d) — col/row mapper
 *   showApiError(msg) / clearApiError() — user-visible error banner
 */
(function (global) {
  "use strict";

  /* ── LOGGER ────────────────────────────────────────────────────────────── */
  var LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
  var MIN_LEVEL = "info"; // raise to 'warn' in prod, lower to 'debug' while developing

  var SoilLog = {
    _write: function (level, tag, args) {
      if (LEVELS[level] < LEVELS[MIN_LEVEL]) return;
      var ts = new Date().toISOString().slice(11, 23);
      var prefix = "[" + ts + "] [" + level.toUpperCase() + "] [" + tag + "]";
      var fn =
        level === "error"
          ? console.error
          : level === "warn"
            ? console.warn
            : console.log;
      fn.apply(console, [prefix].concat(Array.prototype.slice.call(args)));
    },
    debug: function (tag) {
      this._write("debug", tag, Array.prototype.slice.call(arguments, 1));
    },
    info: function (tag) {
      this._write("info", tag, Array.prototype.slice.call(arguments, 1));
    },
    warn: function (tag) {
      this._write("warn", tag, Array.prototype.slice.call(arguments, 1));
    },
    error: function (tag) {
      this._write("error", tag, Array.prototype.slice.call(arguments, 1));
    },
    setLevel: function (level) {
      if (LEVELS[level] !== undefined) MIN_LEVEL = level;
    },
  };

  /* ── GLOBAL ERROR HANDLERS ─────────────────────────────────────────────── */
  window.addEventListener("error", function (e) {
    SoilLog.error(
      "GLOBAL",
      "Uncaught error: " + e.message,
      "at " + (e.filename || "?") + ":" + e.lineno,
    );
  });

  window.addEventListener("unhandledrejection", function (e) {
    var reason = e.reason ? e.reason.message || String(e.reason) : "unknown";
    SoilLog.error("GLOBAL", "Unhandled promise rejection: " + reason);
  });

  /* ── ERROR BANNER ──────────────────────────────────────────────────────── */
  var _banner = null;

  function _ensureBanner() {
    if (_banner) return _banner;
    _banner = document.createElement("div");
    _banner.id = "soil-error-banner";
    _banner.style.cssText = [
      "display:none",
      "position:fixed",
      "bottom:16px",
      "left:50%",
      "transform:translateX(-50%)",
      "z-index:9999",
      "background:#1a0808",
      "border:1px solid #7f1d1d",
      "border-radius:8px",
      "padding:10px 16px",
      "font-size:12px",
      "color:#fca5a5",
      "max-width:480px",
      "width:calc(100% - 32px)",
      "display:flex",
      "align-items:center",
      "gap:10px",
      "box-shadow:0 4px 20px rgba(0,0,0,.5)",
    ].join(";");
    var icon = document.createElement("span");
    icon.textContent = "⚠";
    icon.style.cssText = "flex-shrink:0;font-size:14px";
    var msg = document.createElement("span");
    msg.id = "soil-error-msg";
    msg.style.cssText = "flex:1;line-height:1.5";
    var close = document.createElement("button");
    close.textContent = "✕";
    close.style.cssText = [
      "background:none",
      "border:none",
      "color:#fca5a5",
      "cursor:pointer",
      "font-size:14px",
      "flex-shrink:0",
      "padding:0 2px",
    ].join(";");
    close.onclick = function () {
      _banner.style.display = "none";
    };
    _banner.appendChild(icon);
    _banner.appendChild(msg);
    _banner.appendChild(close);
    document.body.appendChild(_banner);
    return _banner;
  }

  function showApiError(msg) {
    var b = _ensureBanner();
    document.getElementById("soil-error-msg").textContent =
      msg || "Data could not be loaded. Try refreshing the page.";
    b.style.display = "flex";
    SoilLog.warn("BANNER", msg);
    setTimeout(function () {
      if (b) b.style.display = "none";
    }, 12000);
  }

  function clearApiError() {
    if (_banner) _banner.style.display = "none";
  }

  /* ── SDA API WRAPPER ───────────────────────────────────────────────────── */
  var SDA_URL = "https://sdmdataaccess.sc.egov.usda.gov/tabular/post.rest";
  var SDA_TIMEOUT = 30000;
  var MAX_RETRIES = 2;
  var RETRY_DELAY = 1500; // ms between retries

  /**
   * sdaPost(query, opts) → Promise<responseData>
   * Works with or without jQuery (falls back to fetch API).
   *
   * opts:
   *   format   {string}  'json+columnname' (default) | 'json'
   *   retries  {number}  override retry count
   *   tag      {string}  label shown in console logs
   *   silent   {boolean} suppress the user-visible error banner
   */
  function sdaPost(query, opts) {
    opts = opts || {};
    var format = opts.format || "json+columnname";
    var retries = opts.retries !== undefined ? opts.retries : MAX_RETRIES;
    var tag = opts.tag || "SDA";
    var silent = opts.silent || false;
    var t0 = performance.now();
    var querySnip = query.length > 120 ? query.slice(0, 118) + "…" : query;

    SoilLog.debug(tag, "Query: " + querySnip);

    return new Promise(function (resolve, reject) {
      function attempt(left) {
        var attemptNum = retries - left + 1;
        SoilLog.debug(
          tag,
          "Attempt " + attemptNum + (left < retries ? " (retry)" : ""),
        );

        function onSuccess(d) {
          var ms = Math.round(performance.now() - t0);
          var rows = d && d.Table ? d.Table.length - 1 : 0;
          SoilLog.info(tag, "OK " + ms + "ms · " + rows + " row(s)");
          clearApiError();
          resolve(d);
        }

        function onFailure(detail) {
          var ms = Math.round(performance.now() - t0);
          SoilLog.warn(
            tag,
            "Attempt " +
              attemptNum +
              " failed (" +
              detail +
              ") after " +
              ms +
              "ms",
          );
          if (left > 0) {
            SoilLog.info(
              tag,
              "Retrying in " + RETRY_DELAY + "ms (" + left + " left)",
            );
            setTimeout(function () {
              attempt(left - 1);
            }, RETRY_DELAY);
          } else {
            var errMsg =
              "Soil Data Access unavailable — " +
              detail +
              ". Some charts may not load.";
            SoilLog.error(tag, "All retries exhausted. " + errMsg);
            if (!silent) showApiError(errMsg);
            reject(new Error("sdaPost failed: " + detail));
          }
        }

        // Use jQuery if available, otherwise native fetch
        if (typeof $ !== "undefined" && typeof $.ajax === "function") {
          $.ajax({
            type: "POST",
            url: SDA_URL,
            data: { query: query, format: format },
            dataType: "json",
            timeout: SDA_TIMEOUT,
          })
            .done(onSuccess)
            .fail(function (xhr, status, err) {
              onFailure(
                status === "timeout"
                  ? "request timed out after " + SDA_TIMEOUT / 1000 + "s"
                  : status + (err ? " — " + err : ""),
              );
            });
        } else {
          // fetch fallback (no jQuery)
          var ctrl = new AbortController();
          var timer = setTimeout(function () {
            ctrl.abort();
          }, SDA_TIMEOUT);
          var body =
            "query=" +
            encodeURIComponent(query) +
            "&format=" +
            encodeURIComponent(format);
          fetch(SDA_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body,
            signal: ctrl.signal,
          })
            .then(function (r) {
              clearTimeout(timer);
              if (!r.ok) throw new Error("HTTP " + r.status);
              return r.json();
            })
            .then(onSuccess)
            .catch(function (e) {
              clearTimeout(timer);
              onFailure(
                e.name === "AbortError"
                  ? "request timed out after " + SDA_TIMEOUT / 1000 + "s"
                  : e.message || String(e),
              );
            });
        }
      }
      attempt(retries);
    });
  }

  /* ── DATA HELPERS ──────────────────────────────────────────────────────── */

  /** Returns true if d has at least minRows data rows (not counting header). */
  function sdaHasRows(d, minRows) {
    minRows = minRows === undefined ? 1 : minRows;
    return !!(d && d.Table && d.Table.length > minRows);
  }

  /**
   * Converts SDA json+columnname response to { cols, rows } where each row is
   * an object keyed by column name.
   */
  function sdaParseRows(d) {
    if (!sdaHasRows(d)) return { cols: [], rows: [] };
    var cols = d.Table[0];
    var rows = d.Table.slice(1).map(function (r) {
      var o = {};
      cols.forEach(function (c, i) {
        o[c] = r[i];
      });
      return o;
    });
    return { cols: cols, rows: rows };
  }

  /* ── PAGE HEALTH CHECK ─────────────────────────────────────────────────── */
  /**
   * Logs key environment info on page load to help debugging.
   * Called automatically — check the console Network / Soil tag.
   */
  (function healthCheck() {
    SoilLog.info("BOOT", "Soil Intelligence shared.js loaded");
    SoilLog.info("BOOT", "Page: " + window.location.pathname);
    SoilLog.debug("BOOT", "UA: " + navigator.userAgent.slice(0, 80));
    if (typeof $ === "undefined") {
      SoilLog.error("BOOT", "jQuery not found — sdaPost will not work");
    }
    if (typeof maplibregl !== "undefined") {
      SoilLog.info("BOOT", "MapLibre GL " + (maplibregl.version || "?"));
    }
    if (typeof echarts !== "undefined") {
      SoilLog.info("BOOT", "ECharts present");
    }
  })();

  /* ── EXPORTS ───────────────────────────────────────────────────────────── */
  global.SoilLog = SoilLog;
  global.sdaPost = sdaPost;
  global.sdaHasRows = sdaHasRows;
  global.sdaParseRows = sdaParseRows;
  global.showApiError = showApiError;
  global.clearApiError = clearApiError;
})(window);
