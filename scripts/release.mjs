#!/usr/bin/env node
// Prochaine version semver + changelog, déduits des Conventional Commits depuis le dernier tag vX.Y.Z.
// Zéro dépendance. N'écrit et ne tague RIEN : la release est une porte humaine.
//   node scripts/release.mjs [--from <ref>] [--to <ref>]   (défaut : dernier tag → dev)
import { execSync } from "node:child_process";

const argv = process.argv.slice(2);
const opt = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const git = (c) => execSync(`git ${c}`, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();

let last = "";
try { last = git("describe --tags --abbrev=0 --match 'v[0-9]*.[0-9]*.[0-9]*' " + opt("--to", "dev")); } catch {}
const from = opt("--from", last), to = opt("--to", "dev");
const SEP = "\u001e";
const raw = git(`log --format=%H%x1f%s%x1f%b${SEP} ${from ? `${from}..${to}` : to}`);
const commits = raw.split(SEP).map((c) => c.trim()).filter(Boolean).map((c) => {
  const [hash, subject, body = ""] = c.split("\u001f");
  const m = subject.match(/^(\w+)(?:\(([^)]+)\))?(!)?: (.+)$/);
  return m && { hash: hash.slice(0, 7), type: m[1], scope: m[2], breaking: !!m[3] || /^BREAKING[ -]CHANGE:/m.test(body), desc: m[4] };
}).filter(Boolean);

const [maj, min, pat] = (last.replace(/^v/, "") || "0.0.0").split(".").map(Number);
const bump = commits.some((c) => c.breaking) ? "major" : commits.some((c) => c.type === "feat") ? "minor"
  : commits.some((c) => ["fix", "perf"].includes(c.type)) ? "patch" : null;
if (!bump) { console.log(`aucun commit feat/fix/perf/breaking depuis ${last || "l'origine"} : pas de release`); process.exit(0); }
// En 0.x, un breaking change n'incrémente que le mineur (semver §4).
const next = bump === "major" ? (maj === 0 ? `0.${min + 1}.0` : `${maj + 1}.0.0`)
  : bump === "minor" ? `${maj}.${min + 1}.0` : `${maj}.${min}.${pat + 1}`;

const section = (title, list) => list.length ? `### ${title}\n${list.map((c) => `- ${c.scope ? `**${c.scope}** : ` : ""}${c.desc} (${c.hash})`).join("\n")}\n` : "";
console.log(`## v${next} — ${new Date().toISOString().slice(0, 10)}  (${last || "initiale"} → ${bump})\n`);
console.log([
  section("Ruptures", commits.filter((c) => c.breaking)),
  section("Fonctionnalités", commits.filter((c) => c.type === "feat" && !c.breaking)),
  section("Corrections", commits.filter((c) => ["fix", "perf"].includes(c.type) && !c.breaking)),
].filter(Boolean).join("\n"));
