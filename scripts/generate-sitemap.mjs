#!/usr/bin/env node
// generate-sitemap.mjs — regenerate sitemap.xml from the repo's real page
// inventory (no deps).
//
// Usage:  node scripts/generate-sitemap.mjs        (writes sitemap.xml)
//         node scripts/generate-sitemap.mjs --dry  (print URLs, write nothing)
//
// Inventory rules:
//   * Every .html page under the repo root, EXCEPT:
//       - build/system dirs (_next, node_modules, scripts, .git, assets, data,
//         vendor, wiki, landing, 404)
//       - redirect stubs (any page with <meta http-equiv="refresh">)
//       - 404 pages, googlef* verification files, lab10yr_landing.html (the
//         worker serves it as "/"), and known orphans (pro-welcome.html)
//   * URL style matches the site's canonicals: "/" for the root index,
//     "/dir/" for directory indexes, extensionless ("/soil-atlas") for
//     everything else.

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const ORIGIN = "https://lab10yr.com";
const SKIP_DIRS = new Set([
  "_next", "node_modules", "scripts", ".git", "assets", "data", "vendor",
  "wiki", "landing", "404",
]);
const SKIP_FILES = new Set([
  "404.html",
  "lab10yr_landing.html", // served as "/" by the worker
  "pro-welcome.html",     // orphan (post-purchase page, no inbound links)
]);
const REDIRECT_RE = /<meta[^>]+http-equiv=["']?refresh/i;

function htmlFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = relative(ROOT, full);
    if (rel.split(sep).some((p) => SKIP_DIRS.has(p))) continue;
    const st = statSync(full);
    if (st.isDirectory()) htmlFiles(full, out);
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

function urlFor(rel) {
  const parts = rel.split(sep);
  const file = parts[parts.length - 1];
  if (file === "index.html") {
    const dir = parts.slice(0, -1).join("/");
    return dir ? "/" + dir + "/" : "/";
  }
  return "/" + parts.join("/").replace(/\.html$/, "");
}

function priorityFor(url) {
  if (url === "/") return "1.0";
  const depth = url.replace(/\/$/, "").split("/").length - 1;
  if (url.startsWith("/articles/")) return "0.6";
  return depth <= 1 ? "0.8" : "0.7";
}

const urls = [];
for (const f of htmlFiles(ROOT)) {
  const rel = relative(ROOT, f).split(sep).join("/");
  const base = rel.split("/").pop();
  if (SKIP_FILES.has(base) || /^googlef/i.test(base)) continue;
  const head = readFileSync(f, "utf8").slice(0, 2000);
  if (REDIRECT_RE.test(head)) continue; // redirect stub
  urls.push(urlFor(rel.split("/").join(sep)));
}

// When both /name (legacy .html) and /name/ (marketing dir) exist, the
// directory page is canonical — drop the legacy twin (e.g. /services).
const dirSet = new Set(urls.filter((u) => u.endsWith("/")));
const deduped = urls.filter((u) => u.endsWith("/") || !dirSet.has(u + "/"));

deduped.sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)));

const body = deduped
  .map((u) =>
    [
      "  <url>",
      `    <loc>${ORIGIN}${u}</loc>`,
      `    <priority>${priorityFor(u)}</priority>`,
      `    <changefreq>${u === "/" ? "weekly" : "monthly"}</changefreq>`,
      "  </url>",
    ].join("\n"),
  )
  .join("\n");

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  body +
  "\n</urlset>\n";

if (process.argv.includes("--dry")) {
  console.log(deduped.join("\n"));
  console.log(`\n${deduped.length} URLs (dry run, nothing written)`);
} else {
  writeFileSync(join(ROOT, "sitemap.xml"), xml);
  console.log(`sitemap.xml written: ${deduped.length} URLs`);
}
