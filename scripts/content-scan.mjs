#!/usr/bin/env node
// content-scan.mjs — flag exported pages that are missing body content (stubs).
// Measures visible text length per page; prints the thinnest. Run: node scripts/content-scan.mjs
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function pages(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (f.includes("_next") || f.includes("node_modules") || f.includes(".git")) continue;
    if (statSync(f).isDirectory()) pages(f, out);
    else if (n.endsWith(".html")) out.push(f);
  }
  return out;
}
function textLen(html) {
  const body = html.split(/<body[^>]*>/i)[1] || html;
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}
const rows = pages(".")
  .map((f) => ({ p: f.replace(/\\/g, "/").replace(/^\.\//, ""), len: textLen(readFileSync(f, "utf8")) }))
  .sort((a, b) => a.len - b.len);
console.log("Thinnest pages (visible text chars):");
for (const r of rows.slice(0, 24)) console.log(`  ${String(r.len).padStart(6)}  ${r.p}`);
const thin = rows.filter((r) => r.len < 800);
console.log(`\nTotal ${rows.length} pages; ${thin.length} under 800 chars (likely stubs).`);
