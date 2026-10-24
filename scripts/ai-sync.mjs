#!/usr/bin/env node
// Génère la config de chaque harness depuis .ai/ (source de vérité unique).
// Zéro dépendance. Usage : node scripts/ai-sync.mjs [--check]
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, ".ai");
const CHECK = process.argv.includes("--check");
const cfg = JSON.parse(fs.readFileSync(path.join(SRC, "config.json"), "utf8"));
const HEADER = "<!-- GÉNÉRÉ par scripts/ai-sync.mjs depuis .ai/ — ne pas éditer -->\n";
let drift = 0;

function parse(file) {
  const raw = fs.readFileSync(file, "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`Frontmatter manquant : ${file}`);
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m[2].trim() + "\n" };
}
const fm = (o) => "---\n" + Object.entries(o).map(([k, v]) =>
  typeof v === "object"
    ? `${k}:\n` + Object.entries(v).map(([a, b]) => `  ${a}: ${b}`).join("\n")
    : `${k}: ${v}`).join("\n") + "\n---\n";

// Fichiers générés par ce script : seuls eux peuvent être écrasés. Un fichier du projet est conservé.
const MANIFEST = path.join(SRC, ".generated.json");
const generated = new Set(fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : []);
const seen = new Set();
function write(file, content, { owned = false } = {}) {
  const rel = path.relative(ROOT, file);
  const cur = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  if (!owned && cur !== null && cur !== content && !generated.has(rel) && !cur.includes(HEADER.trim())) {
    console.error(`⚠ conservé, fichier du projet : ${rel} (fusionne à la main si besoin)`); return;
  }
  if (!owned) seen.add(rel);
  if (cur === content) return;
  if (CHECK) { console.error(`✗ désynchronisé : ${path.relative(ROOT, file)}`); drift++; return; }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  console.log(`✓ ${path.relative(ROOT, file)}`);
}
const list = (d) => fs.existsSync(d) ? fs.readdirSync(d) : [];

// Agents
for (const f of list(path.join(SRC, "agents")).filter((f) => f.endsWith(".md"))) {
  const { meta, body } = parse(path.join(SRC, "agents", f));
  const tier = meta.tier || "strong", access = meta.access || "read";
  const claudeExtra = Object.fromEntries(Object.entries(meta)
    .filter(([k]) => k.startsWith("claude.")).map(([k, v]) => [k.slice(7), v]));
  if (cfg.harnesses.includes("claude"))
    write(path.join(ROOT, ".claude/agents", f), fm({
      name: meta.name, description: meta.description,
      tools: cfg.access[access].claude, model: cfg.models.claude[tier], ...claudeExtra,
    }) + HEADER + body);
  if (cfg.harnesses.includes("opencode"))
    write(path.join(ROOT, ".opencode/agent", f), fm({
      description: meta.description, mode: "subagent",
      model: cfg.models.opencode[tier], tools: cfg.access[access].opencode,
    }) + HEADER + body);
}

// Commandes
for (const f of list(path.join(SRC, "commands")).filter((f) => f.endsWith(".md"))) {
  const { meta, body } = parse(path.join(SRC, "commands", f));
  if (cfg.harnesses.includes("claude"))
    write(path.join(ROOT, ".claude/commands", f), fm({ description: meta.description }) + HEADER + body);
  if (cfg.harnesses.includes("opencode"))
    write(path.join(ROOT, ".opencode/command", f), fm({ description: meta.description }) + HEADER + body);
}

// Skills (format SKILL.md standard) : dossier copié en entier (SKILL.md + references/…)
function walk(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(path.join(dir, d.name), base) : [path.relative(base, path.join(dir, d.name))]);
}
for (const s of list(path.join(SRC, "skills"))) {
  const dir = path.join(SRC, "skills", s);
  if (!fs.existsSync(path.join(dir, "SKILL.md"))) continue;
  for (const rel of walk(dir)) {
    const content = fs.readFileSync(path.join(dir, rel), "utf8");
    if (cfg.harnesses.includes("claude")) write(path.join(ROOT, ".claude/skills", s, rel), content);
    if (cfg.harnesses.includes("opencode")) write(path.join(ROOT, ".opencode/skills", s, rel), content);
  }
}

// Config propre à chaque harness (permissions, hooks), FUSIONNÉE dans celle du projet :
// les garde-fous du socle sont toujours présents, les réglages du projet sont conservés.
// Tableaux : union sans doublon. Objets : fusion récursive. Valeur simple : celle du socle.
const merge = (a, b) => Array.isArray(a) && Array.isArray(b)
  ? [...a, ...b.filter((x) => !a.some((y) => JSON.stringify(y) === JSON.stringify(x)))]
  : a && b && typeof a === "object" && typeof b === "object" && !Array.isArray(a) && !Array.isArray(b)
    ? Object.fromEntries([...new Set([...Object.keys(a), ...Object.keys(b)])].map((k) => [k, k in a && k in b ? merge(a[k], b[k]) : k in b ? b[k] : a[k]]))
    : b;
function harnessConfig(file, src) {
  const socle = fs.readFileSync(path.join(SRC, "harness", src), "utf8");
  if (!fs.existsSync(file)) return write(file, socle, { owned: true });
  const cur = fs.readFileSync(file, "utf8");
  const next = JSON.stringify(merge(JSON.parse(cur), JSON.parse(socle)), null, 2) + "\n";
  write(file, JSON.stringify(JSON.parse(cur)) === JSON.stringify(JSON.parse(next)) ? cur : next, { owned: true });
}
if (cfg.harnesses.includes("claude")) harnessConfig(path.join(ROOT, ".claude/settings.json"), "claude.settings.json");
if (cfg.harnesses.includes("opencode")) harnessConfig(path.join(ROOT, "opencode.json"), "opencode.json");

// Templates de PR (GitHub) / MR (GitLab) : une seule source
const PR = path.join(SRC, "templates/pull_request.md");
if (fs.existsSync(PR)) {
  const tpl = fs.readFileSync(PR, "utf8");
  if ((cfg.forges || []).includes("github")) write(path.join(ROOT, ".github/pull_request_template.md"), tpl);
  if ((cfg.forges || []).includes("gitlab")) write(path.join(ROOT, ".gitlab/merge_request_templates/Default.md"), tpl);
}

// Blocs balisés dans des fichiers du projet : seul le contenu entre les marqueurs appartient au socle.
// En tête de fichier : les règles et exceptions du projet, placées après, gardent le dernier mot.
function block(file, body, open, close, seed = "") {
  const cur = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  const blk = `${open}\n${body.trimEnd()}\n${close}`;
  const i = cur?.indexOf(open) ?? -1, j = cur?.indexOf(close) ?? -1;
  const next = cur === null ? `${blk}\n${seed}`
    : i >= 0 && j > i ? cur.slice(0, i) + blk + cur.slice(j + close.length)
    : `${blk}\n\n${cur}`;
  write(file, next, { owned: true });
}
block(path.join(ROOT, "AGENTS.md"), fs.readFileSync(path.join(SRC, "AGENTS.socle.md"), "utf8"),
  "<!-- socle:start — généré depuis .ai/AGENTS.socle.md, ne pas éditer entre ces marqueurs -->", "<!-- socle:end -->",
  "\n## Spécifique au projet\n<!-- Langage, structure des dossiers, conventions propres au projet. -->\n");
block(path.join(ROOT, ".gitignore"), fs.readFileSync(path.join(SRC, "gitignore.socle"), "utf8"),
  "# socle:start (généré, ne pas éditer)", "# socle:end");

// Pont CLAUDE.md -> AGENTS.md (un CLAUDE.md du projet est conservé, la ligne est ajoutée en tête)
if (cfg.harnesses.includes("claude")) {
  const f = path.join(ROOT, "CLAUDE.md"), cur = fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "";
  write(f, /^@AGENTS\.md$/m.test(cur) ? cur : `@AGENTS.md\n${cur}`, { owned: true });
}

if (!CHECK) {
  const list = JSON.stringify([...seen].sort(), null, 2) + "\n";
  if (!fs.existsSync(MANIFEST) || fs.readFileSync(MANIFEST, "utf8") !== list) fs.writeFileSync(MANIFEST, list);
}
if (CHECK && drift) { console.error(`${drift} fichier(s) à régénérer : lance \`just ai-sync\``); process.exit(1); }
if (CHECK) console.log("✓ config agents synchronisée");
