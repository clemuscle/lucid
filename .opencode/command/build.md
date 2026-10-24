---
description: Implémente une US (la prochaine ready si non précisée) en TDD
---
<!-- GÉNÉRÉ par scripts/ai-sync.mjs depuis .ai/ — ne pas éditer -->
US : $ARGUMENTS (sinon la première `in_progress`, puis la première `ready` par priorité, via `node scripts/board.mjs status`).
1. Si elle est `ready` : `node scripts/board.mjs move --us <id> --to in_progress --actor dev`.
   Crée ou reprends la branche `<type>/<id>-<slug>` depuis `dev` (skill `git-workflow`).
2. US non triviale sans `specs/NNN-slug/plan.md` → plan d'abord (skill `planning`). Ensuite on exécute, sans replanifier.
3. Délègue les tests à `test-writer` (enveloppe complète, skill `delegation`) et vérifie qu'ils sont rouges pour la bonne raison.
4. Implémente en TDD (skill `tdd-loop`), en restant dans le périmètre de l'US. Tâches indépendantes du plan :
   agents `dev` en parallèle seulement si aucun fichier en commun. `just check` vert, colle la preuve.
5. `bash scripts/hooks/dod-gate.sh <id>` puis `node scripts/board.mjs move --us <id> --to review --actor dev`.

**Mode boucle (`AI_LOOP=1`)** : tu ne poses AUCUNE question et tu n'attends aucune validation.
Si tu es bloqué (spec ambiguë, dépendance tierce nécessaire, 3 échecs d'affilée) :
`node scripts/board.mjs event --type escalation --actor dev --us <id> --note "<obstacle précis + preuve>"`,
puis `move --to blocked`, commit ton travail en cours et arrête-toi.
Sinon (mode piloté) : montre-moi les tests rouges avant d'implémenter, et propose `/review` à la fin.
