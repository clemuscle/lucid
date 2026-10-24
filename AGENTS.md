# AGENTS.md — règles du projet (lues par tous les agents)

## Projet
La vision du projet est `docs/vision.md`. Elle fait foi : intention, périmètre, non-objectifs, contraintes,
glossaire. Tu ne la contredis jamais et tu ne la complètes jamais par supposition.
Historique : `docs/vision-history/` (chaque version approuvée). Exécution : `docs/graph.md` (généré depuis `.ai/graph.json`).
Documentation : `docs/README.md` (point d'entrée, passation à un autre humain).

## Commandes (source de vérité : justfile)
- `just check`  → vision approuvée + lint + typecheck + tests + scans sécu. DOIT passer avant tout commit.
- `just test`   → tests seuls
- `just fmt`    → formatage
- `just release-notes` → prochaine version semver + changelog

## Où trouver quoi
| Situation | Skill / outil |
|---|---|
| Demande humaine, « fix ça », anti-doublon | `intake` · `node scripts/board.mjs search --q "…"` |
| Idées, questions, lever le flou | `brainstorm` (`project-grill` pour la vision) |
| Spec, US, critères EARS | `spec-writing` |
| Plan d'implémentation | `planning` → `specs/NNN-slug/plan.md` |
| Déléguer, paralléliser | `delegation` · `board/schema/task-envelope.schema.json` |
| Implémenter | `tdd-loop` · `iac-conventions` |
| Branche, commit, PR/MR, release | `git-workflow` · `.ai/templates/pull_request.md` |
| Review (demander, faire, recevoir) | `review-protocol` |
| Décision d'architecture, dépendance, changement de vision | `adr` |
| DEX, FEX | `ops-docs` · `docs/components/_template/` |
| Schéma | `diagrams` |
| Erreur d'agent | `lessons` · `docs/lessons/` |

## État du projet = le board
- `board/backlog.json` (US) + `board/board.json` (WIP, events) sont la source de vérité.
- On n'y écrit JAMAIS à la main : uniquement `node scripts/board.mjs` (validé par schéma, verrouillé, tracé).
- Statuts : backlog → ready (Definition of Ready) → in_progress (WIP limité) → review → done (DoD = `just check`).

## Communication
- IA ↔ IA : contrats JSON de `board/schema/` (task-envelope, report, event). Terse, des IDs, pas de prose.
  Un prompt de sous-agent est autoportant : objectif, contexte complet, contraintes, fichiers possédés, hors périmètre, format de sortie.
- Humain ↔ IA : langage naturel. Portes humaines : vision, backlog, architecture, dépendance, blocage, merge, release.
- Si `AI_LOOP=1` : mode boucle, aucune question. Un blocage = `escalation` + `blocked`, jamais une supposition.
- Mode piloté : action longue ou coûteuse (> 3 agents, boucle, gros refactor, scan complet) → préviens et attends l'accord.
- Schéma seulement si un humain comprend mieux avec un visuel ; sinon tableau ou ASCII (skill `diagrams`).

## Workflow obligatoire
0. Pas de vision approuvée (`node scripts/vision.mjs status`) → pas de spec ni d'US. On commence par `/grill`.
1. Aucune US sans problème constaté, sans recherche de doublon, ni sans critères EARS testables rattachés à la vision.
2. UNE US à la fois par agent dev, dans son worktree. Agents parallèles : aucun fichier en commun.
3. Plan d'abord (US non triviale), puis exécution sans replanifier ni solliciter l'humain.
4. Tests d'abord (rouge → vert). Ne jamais modifier un test pour le faire passer sans le signaler.
5. Review par un agent qui n'a pas construit, demande autoportante (skill `review-protocol`).
6. Toute décision d'archi → ADR (composant : `docs/components/<c>/adr/`, transverse : `docs/adr/`).
7. Changement de config, version, emplacement → DEX dans la même PR. Incident reproductible → FEX.
8. Prouver, ne pas affirmer : coller la sortie de la commande qui valide.
9. Avant une tâche, lis les leçons de sa catégorie. Erreur d'agent constatée → leçon écrite + humain notifié (sans validation).

## Écart avec la vision
Une demande ou une discussion contredit la vision → tu ne choisis pas. Tu cites la section et demandes :
« erreur de ta part, ou changement de vision ? ». Changement → `/grill` + ADR + réapprobation. L'humain a toujours la main.

## Git (détail : skill `git-workflow`)
- `<type>/<US-n>-<slug>` → PR vers `dev` ; `release/x.y.z` dev → `main` + tag ; `hotfix/x.y.z` depuis `main`.
- Conventional Commits, sujet ≤ 72, corps en puces techniques courtes. Trailers : `Refs`, `Agent`, `Model`, `Harness`, `Requested-by`.
- SemVer. PR/MR : template complet, traçabilité visible (humain, agents, modèles, harness, relecteur), un problème réel.

## Interdits
- Pas de secret en dur, jamais. Pas de `--no-verify`. Pas de push direct sur `dev`/`main`.
- Pas de modification hors du périmètre de la tâche en cours.
- Pas de nouvelle dépendance tierce sans accord humain explicite préalable (nom, version, licence, alternative), puis ADR + DEX.
- En cas d'ambiguïté : s'arrêter et poser la question (ou escalader en mode boucle). Jamais de supposition.
- Ne jamais approuver la vision, ni modifier `docs/.vision.lock` ou `.ai/graph.json`.
- Pas de réponse performative (« Parfait ! ») : reformuler, vérifier, puis agir.

## Conventions
- Doc : phrases courtes, tableaux, commandes exactes. Un fait à un seul endroit, ailleurs un lien.
<!-- Langage, structure des dossiers, style. Le détail va dans .ai/skills/. -->
