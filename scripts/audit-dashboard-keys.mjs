// One-off audit: find dashboard.* keys referenced in src but missing from locale bundles.
// Run with: node scripts/audit-dashboard-keys.mjs
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const root = path.resolve("src");

function walk(dir, acc = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p, acc);
    else if (/\.tsx?$/.test(f)) acc.push(p);
  }
  return acc;
}

const used = new Set();
for (const f of walk(root)) {
  const src = fs.readFileSync(f, "utf8");
  for (const m of src.matchAll(/["'`](dashboard\.[A-Za-z0-9_]+)["'`]/g)) used.add(m[1]);
}

function flat(o, p = "") {
  return Object.entries(o).flatMap(([k, v]) =>
    typeof v === "object" && v ? flat(v, p + k + ".") : [p + k],
  );
}

const LOCALES = ["en", "hi", "as", "bn", "ne", "brx", "mni", "lus", "kha", "trp"];
let failed = false;
for (const lang of LOCALES) {
  const bundle = require(`../src/locales/${lang}.json`);
  const keys = new Set(flat(bundle));
  const missing = [...used].filter((k) => !keys.has(k));
  if (missing.length) {
    failed = true;
    console.log(`MISSING in ${lang}.json (${missing.length}):`);
    for (const k of missing) console.log("  " + k);
  } else {
    console.log(`${lang}.json: all ${used.size} referenced dashboard keys present`);
  }
}
process.exitCode = failed ? 1 : 0;
