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

function write(file, content) {
  const cur = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
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

// Config propre à chaque harness (permissions, hooks)
if (cfg.harnesses.includes("claude"))
  write(path.join(ROOT, ".claude/settings.json"), fs.readFileSync(path.join(SRC, "harness/claude.settings.json"), "utf8"));
if (cfg.harnesses.includes("opencode"))
  write(path.join(ROOT, "opencode.json"), fs.readFileSync(path.join(SRC, "harness/opencode.json"), "utf8"));

// Templates de PR (GitHub) / MR (GitLab) : une seule source
const PR = path.join(SRC, "templates/pull_request.md");
if (fs.existsSync(PR)) {
  const tpl = fs.readFileSync(PR, "utf8");
  if ((cfg.forges || []).includes("github")) write(path.join(ROOT, ".github/pull_request_template.md"), tpl);
  if ((cfg.forges || []).includes("gitlab")) write(path.join(ROOT, ".gitlab/merge_request_templates/Default.md"), tpl);
}

// Pont CLAUDE.md -> AGENTS.md
if (cfg.harnesses.includes("claude")) write(path.join(ROOT, "CLAUDE.md"), "@AGENTS.md\n");

if (CHECK && drift) { console.error(`${drift} fichier(s) à régénérer : lance \`just ai-sync\``); process.exit(1); }
if (CHECK) console.log("✓ config agents synchronisée");
