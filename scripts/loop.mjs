#!/usr/bin/env node
// Boucle autonome (style « Ralph ») qui exécute le graphe .ai/graph.json sur le board.
// Chaque itération lance un NOUVEAU processus d'agent : contexte neuf, mémoire = fichiers (board, specs, git).
//
//   node scripts/loop.mjs [--max N] [--dry-run]
//   Arrêt propre à tout moment : touch .loop-stop
//
// Préconditions : vision approuvée, sandbox (AI_SANDBOX=1) sauf --dry-run.
// Garde-fous : budget d'itérations, timeout par itération, tentatives max par US (→ blocked + preuve),
// arrêt après N itérations sans progrès, arrêt aux portes humaines.
import fs from "node:fs";
import path from "node:path";
import { spawnSync, execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { visionStatus } from "./vision.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, ".ai/config.json"), "utf8")).loop;
const graph = JSON.parse(fs.readFileSync(path.join(ROOT, ".ai/graph.json"), "utf8"));
const argv = process.argv.slice(2);
const DRY = argv.includes("--dry-run");
const MAX = Number(argv[argv.indexOf("--max") + 1]) || cfg.max_iterations;
const STOP = path.join(ROOT, ".loop-stop");
const board = (...a) => execSync(`node scripts/board.mjs ${a.join(" ")}`, { cwd: ROOT }).toString();
const quote = (s) => `'${String(s).replace(/'/g, "'\\''")}'`;
const log = (note, us) => board("event", "--type note", "--actor loop", us ? `--us ${us}` : "", `--note ${quote(note)}`);
const say = (m) => console.log(`[loop] ${m}`);

function state() {
  const items = JSON.parse(fs.readFileSync(path.join(ROOT, "board/backlog.json"), "utf8")).items;
  const events = JSON.parse(fs.readFileSync(path.join(ROOT, "board/board.json"), "utf8")).events;
  return { items, events };
}
const byPrio = (a, b) => a.priority - b.priority;

// Choix de la prochaine action, dans l'ordre du graphe : finir avant de commencer.
function nextAction({ items }) {
  for (const st of ["review", "in_progress", "ready"]) {
    const it = items.filter((x) => x.status === st).sort(byPrio)[0];
    if (!it) continue;
    const command = graph.states[st === "ready" ? "in_progress" : st].loop_command;
    return { us: it.id, from: st, command };
  }
  return null;
}
const failures = ({ events }, us) =>
  events.filter((e) => e.us === us && ((e.type === "gate" && e.note === "DoD échouée") || (e.actor === "loop" && e.note?.startsWith("sans progrès")))).length;

// --- préconditions ---
const v = visionStatus().state;
if (v !== "APPROUVÉE") { console.error(`✗ vision ${v} : /grill puis just vision-approve`); process.exit(1); }
if (!DRY && process.env.AI_SANDBOX !== "1") { console.error("✗ la boucle autonome ne tourne que dans le devcontainer (AI_SANDBOX=1)"); process.exit(1); }
if (!cfg.commands[cfg.harness]) { console.error(`✗ harness inconnu : ${cfg.harness}`); process.exit(1); }
fs.rmSync(STOP, { force: true });
// Traçabilité (trailers git, PR) : l'humain qui a lancé la boucle.
let requestedBy = "inconnu";
try { requestedBy = execSync("git config user.name", { cwd: ROOT }).toString().trim() || requestedBy; } catch {}

let noProgress = 0, i = 0, reason = "budget d'itérations atteint";
for (; i < MAX; i++) {
  if (fs.existsSync(STOP)) { reason = "arrêt demandé (.loop-stop)"; break; }
  const s = state();
  const blocked = s.items.filter((x) => x.status === "blocked").map((x) => x.id);
  const act = nextAction(s);
  if (!act) {
    const waiting = s.items.filter((x) => x.status === "backlog").length;
    reason = waiting ? `porte humaine : ${waiting} US en backlog à valider (Definition of Ready)` : "plus aucune US à traiter";
    break;
  }
  if (failures(s, act.us) >= graph.max_attempts) {
    say(`${act.us} : ${graph.max_attempts} échecs → blocked (porte humaine)`);
    if (!DRY) {
      board("event", "--type escalation", "--actor loop", `--us ${act.us}`, `--note ${quote(`${graph.max_attempts} tentatives échouées, voir events`)}`);
      board("move", `--us ${act.us}`, "--to blocked", "--actor loop");
    }
    if (DRY) { reason = "dry-run"; break; }
    continue;
  }

  const prompt = `/${act.command} ${act.us}`;
  const cmd = cfg.commands[cfg.harness].map((x) => x.replace("{prompt}", prompt));
  say(`itération ${i + 1}/${MAX} : ${act.us} (${act.from}) → ${prompt}${blocked.length ? `  [bloquées : ${blocked.join(", ")}]` : ""}`);
  if (DRY) { say(`dry-run : ${cmd.join(" ")}`); reason = "dry-run"; i++; break; }

  log(`début ${prompt}`, act.us);
  const t0 = Date.now();
  const r = spawnSync(cmd[0], cmd.slice(1), {
    cwd: ROOT, stdio: "inherit", env: { ...process.env, AI_LOOP: "1", AI_HARNESS: cfg.harness, AI_REQUESTED_BY: requestedBy }, timeout: cfg.timeout_minutes * 60_000,
  });
  const mins = ((Date.now() - t0) / 60000).toFixed(1);
  if (r.error?.code === "ENOENT") { console.error(`✗ commande introuvable : ${cmd[0]}`); process.exit(1); }

  const after = state().items.find((x) => x.id === act.us);
  if (after?.status === act.from) {
    noProgress++;
    log(`sans progrès après ${mins} min (code ${r.status ?? r.signal})`, act.us);
    if (noProgress >= cfg.max_no_progress) { reason = `${noProgress} itérations sans progrès`; i++; break; }
  } else {
    noProgress = 0;
    log(`${act.from} -> ${after?.status} en ${mins} min`, act.us);
  }
}

const fin = state().items.reduce((a, x) => ((a[x.status] = (a[x.status] || 0) + 1), a), {});
say(`fin après ${i} itération(s) : ${reason}`);
say(`board : ${JSON.stringify(fin)}`);
if (!DRY) board("render");
