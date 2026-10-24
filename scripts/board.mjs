#!/usr/bin/env node
// API du board : SEUL moyen d'écrire l'état. Zéro dépendance.
// - Résout toujours le board du dépôt PRINCIPAL (même appelé depuis un worktree).
// - Verrou fichier : écritures concurrentes sûres entre agents parallèles.
// - Valide chaque écriture contre board/schema/ (fail-closed).
//
//   board.mjs list [--status ready]       board.mjs status
//   board.mjs add --us '<json>'           board.mjs ready --us US-1 --actor architect
//   board.mjs move --us US-1 --to review --actor dev#1
//   board.mjs delegate --us US-1 --to dev#1 --payload '<task-envelope>'
//   board.mjs report --actor dev#1 --payload '<report>'
//   board.mjs event --type peer_message --actor dev#1 --target qa --us US-1 --note "..."
//   board.mjs graph   (docs/graph.md depuis .ai/graph.json)
//   board.mjs search --q "export csv"     (anti-doublon : US dont le texte contient TOUS les termes)
//   board.mjs next-id                     board.mjs validate      board.mjs render
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
function mainRoot() {
  try {
    const common = execSync("git rev-parse --path-format=absolute --git-common-dir", {
      cwd: SCRIPT_ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    return path.dirname(common);
  } catch { return SCRIPT_ROOT; }
}
const ROOT = mainRoot();
const B = (f) => path.join(ROOT, "board", f);
const SCHEMA = (n) => JSON.parse(fs.readFileSync(path.join(SCRIPT_ROOT, "board/schema", n), "utf8"));
const fail = (m) => { console.error("erreur: " + m); process.exit(1); };

// ---------- validation JSON Schema (sous-ensemble draft-07) ----------
function check(v, s, at = "$") {
  const e = [];
  const t = Array.isArray(v) ? "array" : v === null ? "null" : Number.isInteger(v) ? "integer" : typeof v;
  if (s.type && !(s.type === t || (s.type === "number" && t === "integer"))) return [`${at}: attendu ${s.type}, reçu ${t}`];
  if (s.enum && !s.enum.includes(v)) e.push(`${at}: '${v}' hors de [${s.enum}]`);
  if (s.pattern && !new RegExp(s.pattern).test(v)) e.push(`${at}: ne respecte pas ${s.pattern}`);
  if (s.minimum !== undefined && v < s.minimum) e.push(`${at}: < ${s.minimum}`);
  if (t === "array") {
    if (s.minItems && v.length < s.minItems) e.push(`${at}: au moins ${s.minItems} élément(s)`);
    if (s.items) v.forEach((x, i) => e.push(...check(x, s.items, `${at}[${i}]`)));
  }
  if (t === "object") {
    for (const r of s.required || []) if (!(r in v)) e.push(`${at}.${r}: requis`);
    for (const [k, x] of Object.entries(v)) {
      if (s.properties?.[k]) e.push(...check(x, s.properties[k], `${at}.${k}`));
      else if (s.additionalProperties === false) e.push(`${at}.${k}: champ inconnu`);
    }
  }
  return e;
}
const assertValid = (obj, schemaFile) => {
  const errs = check(obj, SCHEMA(schemaFile));
  if (errs.length) fail(`${schemaFile}\n  - ` + errs.join("\n  - "));
};

// ---------- verrou ----------
const LOCK = B(".lock");
function withLock(fn) {
  const start = Date.now();
  for (;;) {
    try { fs.mkdirSync(LOCK); break; } catch {
      try { if (Date.now() - fs.statSync(LOCK).mtimeMs > 15000) fs.rmSync(LOCK, { recursive: true }); } catch {}
      if (Date.now() - start > 20000) fail("verrou du board indisponible");
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
    }
  }
  try { return fn(); } finally { fs.rmSync(LOCK, { recursive: true, force: true }); }
}

// ---------- état ----------
const read = (f) => JSON.parse(fs.readFileSync(B(f), "utf8"));
const writeAtomic = (f, o) => { const tmp = B(f + ".tmp"); fs.writeFileSync(tmp, JSON.stringify(o, null, 2) + "\n"); fs.renameSync(tmp, B(f)); };
const args = {}; const argv = process.argv.slice(3);
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith("--")) args[argv[i].slice(2)] = argv[i + 1]?.startsWith("--") ? true : argv[++i];
const need = (...k) => k.forEach((x) => args[x] === undefined && fail(`--${x} requis`));
const json = (s, n) => { try { return JSON.parse(s); } catch { fail(`--${n} : JSON invalide`); } };

function mutate(fn) {
  withLock(() => {
    const backlog = read("backlog.json"), board = read("board.json");
    board.wip_limit = GRAPH.wip_limit;
    const ev = (o) => { const e = { ts: new Date().toISOString(), ...o };
      for (const k of Object.keys(e)) if (e[k] === undefined) delete e[k];
      assertValid(e, "event.schema.json"); board.events.push(e); };
    fn({ backlog, board, ev, us: (id) => backlog.items.find((x) => x.id === id) || fail("US introuvable: " + id) });
    backlog.items.forEach((it) => assertValid(it, "item.schema.json"));
    writeAtomic("backlog.json", backlog); writeAtomic("board.json", board);
    console.log("ok");
  });
}

const GRAPH = JSON.parse(fs.readFileSync(path.join(SCRIPT_ROOT, ".ai/graph.json"), "utf8"));
const TRANSITIONS = Object.fromEntries(Object.entries(GRAPH.states).map(([k, v]) => [k, v.next]));

// Porte d'entrée du graphe : aucune US tant que la vision n'est pas approuvée.
async function requireVision() {
  const { visionStatus } = await import("./vision.mjs");
  const st = visionStatus().state;
  if (st !== "APPROUVÉE") fail(`vision ${st} : lance /grill puis \`just vision-approve\` avant de créer des US`);
}
if (process.argv[2] === "add") await requireVision();

switch (process.argv[2]) {
  case "list": {
    const items = read("backlog.json").items;
    console.log(JSON.stringify(args.status ? items.filter((x) => x.status === args.status) : items, null, 2)); break;
  }
  case "status": {
    const items = read("backlog.json").items, board = read("board.json");
    const cols = Object.fromEntries(Object.keys(TRANSITIONS).map((c) => [c, items.filter((x) => x.status === c).sort((a, b) => a.priority - b.priority).map((x) => x.id)]));
    console.log(JSON.stringify({ wip: { in_progress: cols.in_progress.length, limit: board.wip_limit }, columns: cols, last_events: board.events.slice(-5) }, null, 2)); break;
  }
  case "search": {
    need("q");
    const fold = (x) => String(x).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const terms = fold(args.q).split(/\s+/).filter(Boolean);
    const hits = read("backlog.json").items.filter((it) => {
      const text = fold([it.title, it.why, ...it.acceptance_criteria, it.component || ""].join(" "));
      return terms.every((t) => text.includes(t));
    });
    console.log(JSON.stringify(hits.map(({ id, status, title }) => ({ id, status, title })), null, 2)); break;
  }
  case "next-id": {
    const n = Math.max(0, ...read("backlog.json").items.map((x) => +x.id.split("-")[1]));
    console.log(`US-${n + 1}`); break;
  }
  case "add": need("us"); mutate(({ backlog, ev }) => {
    const it = { status: "backlog", ...json(args.us, "us") };
    if (backlog.items.some((x) => x.id === it.id)) fail("id déjà utilisé: " + it.id);
    backlog.items.push(it); ev({ type: "note", actor: args.actor || "po", us: it.id, note: "US créée" });
  }); break;
  case "update": need("us", "patch", "actor"); mutate(({ us, ev }) => {
    const it = us(args.us), patch = json(args.patch, "patch");
    if ("id" in patch || "status" in patch) fail("id/status : utilise move");
    Object.assign(it, patch); ev({ type: "note", actor: args.actor, us: it.id, note: "maj " + Object.keys(patch).join(",") });
  }); break;
  case "ready": need("us", "actor"); mutate(({ us, ev }) => {
    const it = us(args.us);
    if (!it.component) fail("Definition of Ready : 'component' manquant");
    if (it.status !== "backlog") fail(`transition ${it.status} -> ready interdite`);
    it.status = "ready"; ev({ type: "ready", actor: args.actor, us: it.id });
  }); break;
  case "move": need("us", "to", "actor"); mutate(({ board, backlog, us, ev }) => {
    const it = us(args.us);
    if (!TRANSITIONS[it.status]?.includes(args.to)) fail(`transition ${it.status} -> ${args.to} interdite`);
    if (args.to === "in_progress" && backlog.items.filter((x) => x.status === "in_progress").length >= board.wip_limit)
      fail(`WIP atteint (${board.wip_limit})`);
    if (args.to === "done") {
      const lastGate = [...board.events].reverse().find((e) => e.type === "gate" && e.us === it.id);
      if (!lastGate || lastGate.note !== "DoD ok") fail("Definition of Done non franchie pour " + it.id);
    }
    const from = it.status; it.status = args.to;
    ev({ type: "move", actor: args.actor, us: it.id, note: `${from}->${args.to}` });
  }); break;
  case "delegate": need("us", "to", "payload"); mutate(({ us, ev }) => {
    us(args.us); const p = json(args.payload, "payload"); assertValid(p, "task-envelope.schema.json");
    ev({ type: "delegate", actor: args.actor || "orchestrator", target: args.to, us: args.us, payload: p });
  }); break;
  case "report": need("actor", "payload"); mutate(({ us, ev }) => {
    const p = json(args.payload, "payload"); assertValid(p, "report.schema.json"); us(p.us);
    ev({ type: "report", actor: args.actor, us: p.us, payload: p });
  }); break;
  case "event": need("type", "actor"); mutate(({ ev }) => {
    ev({ type: args.type, actor: args.actor, target: args.target, us: args.us, note: args.note });
  }); break;
  case "graph": {
    const lines = ["stateDiagram-v2", "  [*] --> backlog: vision approuvée"];
    for (const [st, v] of Object.entries(GRAPH.states)) {
      lines.push(`  ${st}: ${st} (${v.owner})`);
      for (const n of v.next) lines.push(`  ${st} --> ${n}`);
    }
    lines.push("  done --> [*]");
    const md = "# Graphe d'exécution\n\n> Généré par `just graph` depuis `.ai/graph.json`. Ne pas éditer.\n\n```mermaid\n" + lines.join("\n") + "\n```\n\n" +
      "| État | Responsable | Porte | Commande de la boucle |\n|---|---|---|---|\n" +
      Object.entries(GRAPH.states).map(([k, v]) => `| ${k} | ${v.owner} | ${v.gate || ""} | ${v.loop_command ? "/" + v.loop_command : ""} |`).join("\n") +
      `\n\nPortes humaines : ${GRAPH.human_gates.join(", ")}. WIP : ${GRAPH.wip_limit}. Tentatives max par US : ${GRAPH.max_attempts}.\n`;
    fs.writeFileSync(path.join(ROOT, "docs/graph.md"), md); console.log("✓ docs/graph.md"); break;
  }
  case "validate": {
    read("backlog.json").items.forEach((it) => assertValid(it, "item.schema.json"));
    read("board.json").events.forEach((e) => assertValid(e, "event.schema.json"));
    console.log("✓ board valide"); break;
  }
  case "render": {
    const items = read("backlog.json").items, board = read("board.json");
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const col = (c) => `<section><h2>${c} <small>${items.filter((x) => x.status === c).length}</small></h2>${items.filter((x) => x.status === c)
      .sort((a, b) => a.priority - b.priority).map((x) => `<article><b>${esc(x.id)}</b> · P${x.priority}${x.component ? ` · <i>${esc(x.component)}</i>` : ""}<p>${esc(x.title)}</p><ul>${x.acceptance_criteria.map((a) => `<li>${esc(a)}</li>`).join("")}</ul></article>`).join("")}</section>`;
    const html = `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Board</title>
<style>:root{--bg:#fafafa;--fg:#1d1d1f;--card:#fff;--muted:#6b6b70;--line:#e3e3e8}@media(prefers-color-scheme:dark){:root{--bg:#141416;--fg:#eee;--card:#1f1f23;--muted:#9a9aa2;--line:#2c2c31}}
body{margin:0;padding:16px;font:14px system-ui,sans-serif;background:var(--bg);color:var(--fg)}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
h2{font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}article{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:10px;margin-bottom:8px}
ul{padding-left:18px;color:var(--muted);font-size:12px}p{margin:6px 0}</style>
<h1>Board <small>WIP ${items.filter((x) => x.status === "in_progress").length}/${board.wip_limit}</small></h1><main>${Object.keys(TRANSITIONS).map(col).join("")}</main>`;
    fs.writeFileSync(B("board.html"), html); console.log("✓ board/board.html"); break;
  }
  default: console.log("commandes : graph list status search next-id add update ready move delegate report event validate render");
}
