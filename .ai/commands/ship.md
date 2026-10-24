---
description: Prépare la PR/MR vers dev (ou main pour release/hotfix)
---
Skill `git-workflow`. Vérifie, sinon arrête-toi et dis ce qui manque :
- `just check` vert ; review APPROVE par un agent autre que l'auteur ; branche conforme (`just branch-check`) ;
- problème réel et non dupliqué (US liée, `board.mjs search`) ; DEX/FEX/ADR à jour ; aucune dépendance sans accord humain.
Rédige la description depuis le template (`.ai/templates/pull_request.md`), TOUTES les sections remplies, en puces techniques.
Traçabilité : humain demandeur (`$AI_REQUESTED_BY` ou `git config user.name`), chaque agent `rôle#n` avec ce qu'il a fait,
modèle exact, harness, relecteur. Titre = sujet Conventional Commits.
Cible : `dev`. Si `gh` (GitHub) ou `glab` (GitLab) est disponible : crée la PR/MR avec cette description. Le merge reste humain.
