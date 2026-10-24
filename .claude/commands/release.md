---
description: Prépare une release dev → main (semver + changelog). Le tag et le merge restent humains.
---
<!-- GÉNÉRÉ par scripts/ai-sync.mjs depuis .ai/ — ne pas éditer -->
Skill `git-workflow`. Précondition : `dev` à jour, CI verte sur `dev`, aucune US `in_progress` qu'on veut embarquer.
1. `just release-notes` → version proposée + changelog. Montre-les-moi.
2. Après mon accord : branche `release/<x.y.z>` depuis `dev`, commit `chore(release): <x.y.z>` (changelog dans `CHANGELOG.md`).
3. `/ship` vers `main`. Après le merge, rappelle-moi : `git tag v<x.y.z>` sur main, puis PR `main → dev` si main a divergé.
Hotfix : branche `hotfix/<x.y.z>` depuis `main`, même chemin, puis report dans `dev`.
