---
description: qa + security-reviewer en parallèle sur l'US en review
---
US : $ARGUMENTS (sinon la première en `review`). Skill `review-protocol`.
Prépare UNE demande de review autoportante (US, objectif, diff `git diff dev...<branche>`, critères, preuve `just check`,
choix non évidents) : les relecteurs n'ont pas l'historique de la session de dev.
Lance EN PARALLÈLE les sous-agents `qa` et `security-reviewer` avec cette demande. Aucun d'eux n'est l'auteur.
Fusionne leurs rapports en une liste dédupliquée, triée par sévérité.
- Les deux APPROVE et dernière DoD ok → `node scripts/board.mjs move --us <id> --to done --actor qa`, puis prépare la PR (`/ship`).
- Sinon → `move --to in_progress` et enregistre les corrections attendues :
  `node scripts/board.mjs event --type report --actor qa --us <id> --note "<liste terse>"`.
  Remarque bloquante due à une erreur d'agent → leçon (skill `lessons`).

**Mode boucle (`AI_LOOP=1`)** : applique ces règles sans me demander. Ne corrige jamais toi-même le code pendant la review.
Mode piloté : montre-moi le rapport avant tout changement de statut.
