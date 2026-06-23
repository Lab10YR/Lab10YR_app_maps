#!/usr/bin/env node
// site-audit.mjs — Lab10YR static-site guardrail audit (no deps).
//
// One reusable check for the design + language contract:
//   * Banned soil-data language (use NCSS / SSURGO / KSSL / "soil quality").
//   * Em-dash / en-dash in user-facing text (the design contract bans them).
//   * Dead / off-brand links (README.md, raw GitHub, USDA query pages).
//
// Usage:  node scripts/site-audit.mjs            (human report)
//         node scripts/site-audit.mjs --json     (machine report)
// Exit 1 if any HARD violation is found (banned phrase / dead link), so it can
// gate CI. Em-dashes + USDA/NRCS/Web-Soil-Survey are reported as WARN (the last
// is often a factual stat citation that needs a human reframe, not a blind swap).
//
// Scans *.html under the repo root, skipping _next/ (build chunks), node_modules/,
// and this scripts/ dir. Functional API endpoints (`sdmdataaccess...` URLs with no
// spaces) are intentionally NOT flagged — only the user-facing spaced phrase is.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const SKIP_DIRS = new Set(["_next", "node_modules", "scripts", ".git", "assets"]);

// HARD = fail the build. WARN = report only.
const HARD_PHRASES = [
  { re: /Soil Data Access/gi, label: 'banned phrase "Soil Data Access"' },
];
const WARN_PHRASES = [
  { re: /Web Soil Survey/g, label: '"Web Soil Survey" (often a factual stat — reframe by hand)' },
  { re: /\bSoil Health\b/g, label: '"Soil Health" (use "soil quality")' },
  { re: /\bUSDA\b/g, label: '"USDA"' },
  { re: /\bNRCS\b/g, label: '"NRCS"' },
];
const HARD_LINKS = [
  { re: /href="[^"]*README\.md"/gi, label: "dead README.md link" },
  { re: /href="https:\/\/sdmdataaccess[^"]*\.aspx"/gi, label: "USDA SDA query page link" },
];
const WARN_LINKS = [
  { re: /href="https:\/\/github\.com\/[^"]*"/gi, label: "raw GitHub link" },
];
const EM_DASH = /[—–]/g; // — em, – en

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

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

function scan(text, rules) {
  const hits = [];
  for (const { re, label } of rules) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) hits.push({ label, line: lineOf(text, m.index) });
  }
  return hits;
}

const files = htmlFiles(ROOT);
const report = { hard: {}, warn: {}, emDash: {}, fileCount: files.length };
let hardTotal = 0, warnTotal = 0, emTotal = 0;

for (const f of files) {
  const rel = relative(ROOT, f).split(sep).join("/");
  const text = readFileSync(f, "utf8");

  const hard = [...scan(text, HARD_PHRASES), ...scan(text, HARD_LINKS)];
  const warn = [...scan(text, WARN_PHRASES), ...scan(text, WARN_LINKS)];
  EM_DASH.lastIndex = 0;
  const em = (text.match(EM_DASH) || []).length;

  if (hard.length) { report.hard[rel] = hard; hardTotal += hard.length; }
  if (warn.length) { report.warn[rel] = warn; warnTotal += warn.length; }
  if (em) { report.emDash[rel] = em; emTotal += em; }
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ ...report, hardTotal, warnTotal, emTotal }, null, 2));
  process.exit(hardTotal ? 1 : 0);
}

const groupCount = (hits) => {
  const c = {};
  for (const h of hits) c[h.label] = (c[h.label] || 0) + 1;
  return c;
};

console.log(`\nLab10YR site audit — ${files.length} HTML files scanned\n`);

console.log(`HARD violations (fail): ${hardTotal}`);
for (const [f, hits] of Object.entries(report.hard)) {
  for (const [label, n] of Object.entries(groupCount(hits))) console.log(`  ${f}: ${label} x${n}`);
}
if (!hardTotal) console.log("  none — clean.");

console.log(`\nWARN (review): ${warnTotal}`);
const warnByLabel = {};
for (const hits of Object.values(report.warn))
  for (const [label, n] of Object.entries(groupCount(hits)))
    warnByLabel[label] = (warnByLabel[label] || 0) + n;
for (const [label, n] of Object.entries(warnByLabel).sort((a, b) => b[1] - a[1]))
  console.log(`  ${label}: ${n}`);
if (!warnTotal) console.log("  none.");

console.log(`\nEm-dash / en-dash (design contract bans in user-facing text): ${emTotal} across ${Object.keys(report.emDash).length} files`);
const emTop = Object.entries(report.emDash).sort((a, b) => b[1] - a[1]).slice(0, 8);
for (const [f, n] of emTop) console.log(`  ${f}: ${n}`);

console.log(`\n${hardTotal ? "FAIL" : "PASS"} (hard violations: ${hardTotal})\n`);
process.exit(hardTotal ? 1 : 0);
