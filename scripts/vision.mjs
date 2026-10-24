#!/usr/bin/env node
// Porte « vision » : vérifie que docs/vision.md est complète et sans flou, et gère son approbation.
// Zéro dépendance.
//
//   node scripts/vision.mjs check      → vérifie la vision (exit 1 si erreurs)
//   node scripts/vision.mjs status     → BROUILLON | APPROUVÉE | MODIFIÉE (exit 1 si non approuvée)
//   node scripts/vision.mjs approve    → HUMAIN UNIQUEMENT : exige un terminal interactif
//
// L'approbation enregistre l'empreinte SHA-256 de la vision dans docs/.vision.lock
// et archive la version approuvée dans docs/vision-history/ (vNNN-AAAA-MM-JJ.md).
// Toute modification ultérieure invalide l'approbation ; la réapprouver exige un ADR.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import readline from "node:readline";
import { execSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
function mainRoot() {
  try {
    const common = execSync("git rev-parse --path-format=absolute --git-common-dir", {
      cwd: SCRIPT_ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    return path.dirname(common);
  } catch { return SCRIPT_ROOT; }
}
const ROOT = mainRoot();
const VISION = path.join(ROOT, "docs/vision.md");
const LOCK = path.join(ROOT, "docs/.vision.lock");
const HISTORY = path.join(ROOT, "docs/vision-history");

const REQUIRED = [
  "Intention", "Différenciation", "Utilisateurs", "Problème", "Critères de succès", "Périmètre MVP",
  "Non-objectifs", "Après le MVP", "Parcours clés", "Domaine et données", "Intégrations", "Contraintes",
  "Exigences non fonctionnelles", "Sécurité", "Exploitation", "Mode de travail", "Diffusion",
  "Choix laissés ouverts", "Glossaire", "Décisions prises pendant le grill", "Hypothèses", "Risques",
  "Questions ouvertes",
];
// Sections qui peuvent légitimement être vides (une ligne « Aucun. » reste préférable).
const MAY_BE_EMPTY = new Set(["Décisions prises pendant le grill", "Questions ouvertes", "Choix laissés ouverts"]);

const PLACEHOLDERS = [/<nom du projet>/i, /\bTODO\b/, /\bTBD\b/, /\bFIXME\b/, /à définir/i, /à préciser/i, /\?\?\?/, /\bXXX\b/];
const VAGUE = ["peut-être", "probablement", "éventuellement", "on verra", "idéalement", "à terme", "etc.",
  "ce genre de", "et autres", "rapide", "rapidement", "scalable", "performant", "simple", "facilement",
  "beaucoup", "quelques", "plusieurs", "sécurisé", "robuste", "moderne", "intuitif"];

const strip = (s) => s.replace(/<!--[\s\S]*?-->/g, "");

function sections(md) {
  const out = {}; let cur = null;
  for (const line of strip(md).split("\n")) {
    const h = line.match(/^## (.+?)\s*$/);
    if (h) { cur = h[1]; out[cur] = []; continue; }
    if (cur) out[cur].push(line);
  }
  return out;
}
function table(lines) {
  const rows = lines.filter((l) => /^\s*\|/.test(l)).map((l) =>
    l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
  return rows.slice(2); // sans l'en-tête ni la ligne de séparation
}
const contentOf = (lines) => lines.filter((l) => l.trim() && !/^\s*\|/.test(l)).join("\n").trim();
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function checkVision(md) {
  const errors = [], warnings = [];
  const S = sections(md);

  for (const name of REQUIRED) {
    if (!(name in S)) { errors.push(`section manquante : « ## ${name} »`); continue; }
    const rows = table(S[name]);
    if (!MAY_BE_EMPTY.has(name) && !contentOf(S[name]) && rows.length === 0)
      errors.push(`section vide : « ${name} »`);
  }

  const text = strip(md);
  text.split("\n").forEach((line, i) => {
    for (const p of PLACEHOLDERS) if (p.test(line)) errors.push(`ligne ${i + 1} : marqueur non résolu (${p.source}) → « ${line.trim().slice(0, 80)} »`);
  });

  // Mots vagues : avertissements (hors glossaire, où l'on peut justement les définir).
  for (const [name, lines] of Object.entries(S)) {
    if (name === "Glossaire") continue;
    lines.forEach((line) => {
      const l = norm(line);
      for (const w of VAGUE) {
        const re = new RegExp(`(^|[^\\p{L}])${norm(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "u");
        if (re.test(l)) warnings.push(`« ${name} » : mot vague « ${w} » → « ${line.trim().slice(0, 80)} »`);
      }
    });
  }

  const cells = (name, min) => {
    if (!S[name]) return [];
    const rows = table(S[name]);
    if (rows.length < min) errors.push(`« ${name} » : au moins ${min} ligne(s) de tableau attendue(s)`);
    rows.forEach((r, i) => r.forEach((c, j) => { if (!c) errors.push(`« ${name} » ligne ${i + 1} : colonne ${j + 1} vide`); }));
    return rows;
  };

  cells("Critères de succès", 1);
  cells("Glossaire", 1);
  cells("Risques", 1);
  for (const [i, r] of cells("Exigences non fonctionnelles", 1).entries())
    if (r[1] && !/\d/.test(r[1])) errors.push(`« Exigences non fonctionnelles » ligne ${i + 1} : la cible doit être chiffrée (« ${r[1]} »)`);

  if (S["Non-objectifs"]) {
    const items = S["Non-objectifs"].filter((l) => /^\s*([-*]|\d+\.)\s+\S/.test(l));
    if (items.length < 3) errors.push(`« Non-objectifs » : au moins 3 éléments en liste (trouvés : ${items.length})`);
  }

  if (S["Hypothèses"]) for (const [i, r] of table(S["Hypothèses"]).entries()) {
    const st = norm(r[2] || "");
    if (!["validee", "refutee", "a tester"].includes(st)) errors.push(`« Hypothèses » ligne ${i + 1} : statut « ${r[2]} » invalide (validée | réfutée | à tester)`);
    if (st === "a tester" && !r[3]) errors.push(`« Hypothèses » ligne ${i + 1} : « à tester » sans méthode de test`);
  }

  if (S["Questions ouvertes"]) for (const [i, r] of table(S["Questions ouvertes"]).entries()) {
    const bloq = norm(r[2] || ""), st = norm(r[4] || "");
    if (!["oui", "non"].includes(bloq)) errors.push(`« Questions ouvertes » ligne ${i + 1} : Bloquante doit valoir oui | non`);
    if (!["ouverte", "resolue"].includes(st)) errors.push(`« Questions ouvertes » ligne ${i + 1} : statut « ${r[4]} » invalide (ouverte | résolue)`);
    if (bloq === "oui" && st !== "resolue") errors.push(`« Questions ouvertes » ligne ${i + 1} : question BLOQUANTE non résolue → « ${r[1]} »`);
    if (bloq === "non" && st === "ouverte" && !DATE.test(r[3] || "")) errors.push(`« Questions ouvertes » ligne ${i + 1} : échéance AAAA-MM-JJ obligatoire`);
  }

  return { errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
}

const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");

export function visionStatus() {
  if (!fs.existsSync(VISION)) return { state: "ABSENTE" };
  const md = fs.readFileSync(VISION, "utf8");
  if (!fs.existsSync(LOCK)) return { state: "BROUILLON" };
  const lock = JSON.parse(fs.readFileSync(LOCK, "utf8"));
  return lock.sha256 === sha(md) ? { state: "APPROUVÉE", ...lock } : { state: "MODIFIÉE", ...lock };
}

function report({ errors, warnings }) {
  for (const e of errors) console.error("✗ " + e);
  for (const w of warnings) console.error("⚠ " + w);
  if (!errors.length) console.log(`✓ vision structurellement complète${warnings.length ? ` (${warnings.length} avertissement(s) de flou)` : ""}`);
}

async function main(cmd) {
  if (cmd === "check") {
    if (!fs.existsSync(VISION)) { console.error("✗ docs/vision.md absente : lance /grill"); process.exit(1); }
    const r = checkVision(fs.readFileSync(VISION, "utf8")); report(r);
    process.exit(r.errors.length ? 1 : 0);
  }
  if (cmd === "status") {
    const s = visionStatus();
    console.log(`vision : ${s.state}${s.approved_at ? ` (v${s.version || 1} approuvée le ${s.approved_at} par ${s.by})` : ""}`);
    if (s.state === "MODIFIÉE") console.log("→ la vision a changé depuis l'approbation : relis-la puis `just vision-approve`");
    process.exit(s.state === "APPROUVÉE" ? 0 : 1);
  }
  if (cmd === "approve") {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      console.error("✗ approbation réservée à l'humain : lance `just vision-approve` dans ton terminal"); process.exit(1);
    }
    if (!fs.existsSync(VISION)) { console.error("✗ docs/vision.md absente"); process.exit(1); }
    const md = fs.readFileSync(VISION, "utf8");
    const r = checkVision(md); report(r);
    if (r.errors.length) process.exit(1);
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q) => new Promise((res) => rl.question(q, res));
    if (r.warnings.length) {
      const a = await ask(`\n${r.warnings.length} formulation(s) potentiellement floue(s) ci-dessus. Les assumes-tu toutes ? (oui/non) `);
      if (norm(a.trim()) !== "oui") { rl.close(); console.log("→ approbation annulée : précise ces points avec /grill"); process.exit(1); }
    }
    // Changement d'une vision déjà approuvée : ADR obligatoire (pourquoi la vision change).
    const prev = fs.existsSync(LOCK) ? JSON.parse(fs.readFileSync(LOCK, "utf8")) : null;
    let adr;
    if (prev && prev.sha256 !== sha(md)) {
      adr = (await ask("La vision a déjà été approuvée. Chemin de l'ADR qui justifie ce changement (docs/adr/NNNN-….md) : ")).trim();
      if (!adr || !fs.existsSync(path.join(ROOT, adr))) { rl.close(); console.log(`→ approbation annulée : ADR introuvable « ${adr} » (skill adr)`); process.exit(1); }
    }
    const a = await ask("Tu as relu docs/vision.md en entier et elle décrit exactement ce que tu veux ? Tape APPROUVER : ");
    rl.close();
    if (a.trim() !== "APPROUVER") { console.log("→ approbation annulée"); process.exit(1); }
    let by = "inconnu";
    try { by = execSync("git config user.name", { cwd: ROOT }).toString().trim() || by; } catch {}
    const version = (prev?.version || 0) + 1, date = new Date().toISOString().slice(0, 10);
    const archived = path.join("docs/vision-history", `v${String(version).padStart(3, "0")}-${date}.md`);
    fs.mkdirSync(HISTORY, { recursive: true });
    fs.writeFileSync(path.join(ROOT, archived), md);
    const lock = { sha256: sha(md), version, approved_at: date, by, warnings_accepted: r.warnings.length, archived, ...(adr && { adr }) };
    fs.writeFileSync(LOCK, JSON.stringify(lock, null, 2) + "\n");
    console.log(`✓ vision v${version} approuvée et archivée (${archived}). Commit docs/, puis lance /spec.`);
    process.exit(0);
  }
  console.log("usage : vision.mjs check | status | approve");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main(process.argv[2]);
