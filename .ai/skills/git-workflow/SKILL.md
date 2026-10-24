---
name: git-workflow
description: Branches, commits, versions, PR/MR. Utiliser avant toute création de branche, commit, PR/MR ou release.
---
# Git flow du socle

```
feat|fix|docs|refactor|test|chore|ci|perf|build/<US-n>-<slug> ──PR──► dev ──PR release/x.y.z──► main + tag vX.Y.Z
hotfix/x.y.z  (depuis main) ──PR──► main + tag, puis PR main ──► dev
```
- `dev` : environnement de dev (souvent temporaire, pour tester). `main` : releases de prod uniquement.
- Jamais de push direct sur `dev`/`main` (bloqué par guard.sh). Merge = porte humaine.

## Branches
`<type>/<US-n>-<slug-kebab>` depuis `dev`, type = type Conventional Commits. Ex. `feat/US-12-export-csv`.
`release/1.4.0` depuis `dev`, `hotfix/1.4.1` depuis `main`. Vérif : `just branch-check`.

## Commits — Conventional Commits 1.0.0
```
feat(export): ajoute l'export csv des factures

- endpoint GET /invoices.csv, colonnes de la spec 004
- échappement RFC 4180 des champs

Refs: US-12
Agent: dev#1
Model: <identifiant exact du modèle>
Harness: claude
Requested-by: <humain : $AI_REQUESTED_BY sinon git config user.name>
```
- Sujet ≤ 72, impératif, minuscule, sans point. Un commit = un changement cohérent.
- Corps : puces courtes et techniques (quoi + pourquoi si non évident). Pas de prose, pas de récit de session.
- `!` ou `BREAKING CHANGE:` pour une rupture. Validé par `scripts/hooks/git-conventions.sh`.

## Versions — SemVer 2.0.0
`fix`/`perf` → patch, `feat` → mineur, rupture → majeur (en 0.x : mineur). `just release-notes` calcule
la version et le changelog ; l'humain tague (`git tag vX.Y.Z`).

## PR / MR
- Template : `.github/pull_request_template.md` / `.gitlab/merge_request_templates/Default.md`
  (source `.ai/templates/pull_request.md`). Toutes les sections remplies, sinon pas de PR.
- Titre = sujet Conventional Commits. Une PR = une US ou un problème. Cible `dev` (ou `main` pour release/hotfix).
- Refus (ne pas ouvrir) : problème non constaté, doublon (`board.mjs search`), `just check` rouge,
  traçabilité incomplète, dépendance sans accord.
- Traçabilité visible : humain demandeur, chaque agent (rôle#n) avec ce qu'il a fait, modèle, harness, relecteur.
