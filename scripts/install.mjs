#!/usr/bin/env node
// Installe ou met à jour le socle dans le projet courant. Zéro dépendance.
//   npx github:clemuscle/socle-v2 init       (projet neuf ou existant)
//   npx github:clemuscle/socle-v2 update     (nouvelle version du socle)
//   ... --dry-run                            (affiche sans rien écrire)
// N'écrase jamais un fichier du projet : les fichiers du socle sont à côté, ancrés par une ligne
// (justfile → socle.just, lefthook.yml → lefthook-socle.yml, AGENTS.md/.gitignore → bloc balisé).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEST = process.cwd();
const [cmd] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const DRY = process.argv.includes("--dry-run");
const VERSION = JSON.parse(fs.readFileSync(path.join(SRC, "package.json"), "utf8")).version;
const fail = (m) => { console.error(`✗ ${m}`); process.exit(1); };
const git = (...a) => execFileSync("git", a, { cwd: DEST, stdio: ["ignore", "pipe", "pipe"] }).toString().trim();

// Fichiers du socle : remplacés à chaque init/update.
const OWNED = [
  "scripts/ai-sync.mjs", "scripts/board.mjs", "scripts/loop.mjs", "scripts/vision.mjs", "scripts/release.mjs",
  "scripts/hooks/", "board/schema/", ".ai/agents/", ".ai/commands/", ".ai/skills/", ".ai/templates/", ".ai/harness/",
  ".ai/AGENTS.socle.md", ".ai/gitignore.socle", ".ai/NOTICE", "socle.just", "lefthook-socle.yml", ".github/workflows/socle.yml",
  "docs/components/_template/", "docs/vision.template.md", "specs/_template/",
];
// Fichiers de départ : créés s'ils manquent, ensuite ils appartiennent au projet.
const SEED = [
  ".ai/config.json", ".ai/graph.json", "board/backlog.json", "board/board.json", "justfile", "lefthook.yml",
  "docs/README.md", "docs/architecture.md", "docs/adr/.gitkeep", "docs/vision-history/.gitkeep", "docs/lessons/", ".devcontainer/",
];

if (!["init", "update"].includes(cmd)) fail("usage : npx github:clemuscle/socle-v2 init | update [--dry-run]");
if (path.resolve(SRC) === path.resolve(DEST)) fail("lance-moi depuis ton projet, pas depuis le socle");
try { git("rev-parse", "--git-dir"); } catch { fail("pas un dépôt git : lance `git init` d'abord"); }
if (!DRY && git("status", "--porcelain")) fail("arbre git non propre : commit ou stash tes changements d'abord");
const installed = fs.existsSync(path.join(DEST, ".socle-version"));
if (cmd === "init" && installed) fail("socle déjà installé : utilise `update`");
if (cmd === "update" && !installed) fail("socle absent : utilise `init`");

const files = (rel) => {
  const abs = path.join(SRC, rel);
  if (!fs.existsSync(abs)) return [];
  if (!fs.statSync(abs).isDirectory()) return [rel];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((d) => files(path.join(rel, d.name) + (d.isDirectory() ? "/" : "")));
};
const done = { remplacés: [], créés: [], conservés: [], ancrés: [] };
function copy(rel, { overwrite }) {
  const to = path.join(DEST, rel), from = fs.readFileSync(path.join(SRC, rel));
  const exists = fs.existsSync(to);
  if (exists && fs.readFileSync(to).equals(from)) return;
  if (exists && !overwrite) return done.conservés.push(rel);
  (exists ? done.remplacés : done.créés).push(rel);
  if (DRY) return;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.writeFileSync(to, from);
  if (rel.endsWith(".sh") || rel.endsWith(".mjs")) fs.chmodSync(to, 0o755);
}
// Ajoute une ligne d'ancrage dans un fichier existant du projet (idempotent).
function anchor(rel, test, insert) {
  const to = path.join(DEST, rel);
  if (!fs.existsSync(to)) return;
  const cur = fs.readFileSync(to, "utf8");
  if (test.test(cur)) return;
  done.ancrés.push(rel);
  if (!DRY) fs.writeFileSync(to, insert(cur));
}

// Branches : dev (env de dev) puis une branche de travail, pour relire avant merge.
const branch = cmd === "init" ? "chore/integrate-socle-v2" : `chore/update-socle-${VERSION}`;
const start = DRY ? "" : git("branch", "--show-current");
const has = (b) => { try { git("rev-parse", "--verify", "--quiet", b); return true; } catch { return false; } };
if (!DRY) {
  if (has(branch)) fail(`la branche ${branch} existe déjà : merge-la vers dev ou supprime-la (git branch -D ${branch})`);
  if (!has("dev")) git("branch", "dev", has("main") ? "main" : "HEAD");
  git("switch", "-q", "-c", branch, "dev");
}

for (const rel of OWNED.flatMap(files)) copy(rel, { overwrite: true });
for (const rel of SEED.flatMap(files)) copy(rel, { overwrite: false });
anchor("justfile", /^import\s+['"]socle\.just['"]/m, (s) => s.replace(/^(set [^\n]*\n)*/, (m) => `${m}import 'socle.just'\n`));
anchor("lefthook.yml", /lefthook-socle\.yml/, (s) => /^extends:\s*$/m.test(s)
  ? s.replace(/^extends:\s*$/m, "extends:\n  - lefthook-socle.yml") : `extends:\n  - lefthook-socle.yml\n${s}`);

if (DRY) {
  for (const [k, v] of Object.entries(done)) if (v.length) console.log(`${k} (${v.length}) :\n  ${v.join("\n  ")}`);
  console.log("dry-run : rien n'a été écrit (ai-sync non lancé)");
  process.exit(0);
}
fs.writeFileSync(path.join(DEST, ".socle-version"), VERSION + "\n");
const node = (...a) => execFileSync("node", a, { cwd: DEST, stdio: ["ignore", "pipe", "inherit"] });
node("scripts/ai-sync.mjs"); node("scripts/board.mjs", "graph");

// Avertissements utiles : recettes du projet manquantes ou en doublon avec le socle.
const recipes = (f) => fs.existsSync(f) ? [...fs.readFileSync(f, "utf8").matchAll(/^([a-z][\w-]*)[^\n:]*:(?!=)/gm)].map((m) => m[1]) : [];
const mine = recipes(path.join(DEST, "justfile")), socle = new Set(recipes(path.join(DEST, "socle.just")));
const warn = [
  ...mine.filter((r) => socle.has(r)).map((r) => `recette « ${r} » définie dans justfile ET socle.just : renomme la tienne`),
  ...["fmt", "lint", "typecheck", "test"].filter((r) => !mine.includes(r)).map((r) => `recette « ${r} » absente de justfile : \`just check\` échouera`),
];

const subject = `chore: ${cmd === "init" ? "intègre" : "met à jour"} le socle v${VERSION}`;
git("add", "-A");
if (!git("status", "--porcelain")) {
  git("switch", "-q", start);
  git("branch", "-D", branch);
  console.log(`✓ socle v${VERSION} déjà à jour, rien à faire`);
  process.exit(0);
}
try {
  git("commit", "-q", "-m", subject, "-m",
    `- ${done.créés.length} créés, ${done.remplacés.length} remplacés, ${done.ancrés.length} ancrés, ${done.conservés.length} conservés`);
} catch (e) {
  fail(`commit refusé par tes hooks git (changements prêts et indexés) :\n${e.stderr || e.message}\n→ corrige puis : git commit -m "${subject}"`);
}
let hooks = "lefthook absent : installe-le puis `lefthook install`";
try { execFileSync("lefthook", ["install"], { cwd: DEST, stdio: "ignore" }); hooks = "hooks git installés"; } catch {}

console.log(`✓ socle v${VERSION} ${cmd === "init" ? "installé" : "mis à jour"} sur la branche ${branch} (commit fait)`);
console.log(`  ${done.créés.length} créés · ${done.remplacés.length} remplacés · ${done.ancrés.length} ancrés (${done.ancrés.join(", ") || "—"}) · ${done.conservés.length} fichiers du projet conservés`);
console.log(`  ${hooks}`);
for (const w of warn) console.log(`  ⚠ ${w}`);
console.log(cmd === "init"
  ? "→ ensuite : configure fmt/lint/typecheck/test dans justfile, lance ton agent puis /grill, et merge la branche vers dev."
  : "→ ensuite : relis le diff (git show), puis merge la branche vers dev.");
