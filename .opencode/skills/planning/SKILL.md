---
name: planning
description: Écrire un plan d'implémentation tâche par tâche, exécutable sans réflexion supplémentaire. Utiliser avant d'implémenter une US non triviale (> 1 fichier ou > 1 composant).
---
# Plan — `specs/NNN-slug/plan.md`
Toute la réflexion est ici. Pendant l'exécution, on ne replanifie pas et on ne sollicite pas l'humain.

```markdown
# Plan US-n — <titre>
Pré-requis lus : spec, DEX <c>, ADR <n>, leçons <catégorie>.
Décisions : <choix techniques faits ici, avec raison ; ADR si archi>.

## T1 — <verbe + objet>         Agent : dev#1   Dépend de : —
Fichiers : `src/x.ts` (créé), `test/x.test.ts` (créé)
Faire : <étapes précises, signatures, noms>
Test : `<commande>` → rouge `<message attendu>` puis vert
Fini quand : `<commande>` → `<sortie>`
```
- Une tâche = un résultat vérifiable par une commande, ≤ ~30 min de travail.
- Noms exacts (fichiers, fonctions, champs). Aucun « gérer les erreurs » sans dire lesquelles et comment.
- Tâches parallélisables marquées, sans fichier en commun (skill `delegation`).
- Une question non résolue = le plan n'est pas prêt. Pose-la avant (mode piloté) ou escalade (mode boucle).

## Exécution
Applique la tâche telle qu'écrite. Si le plan est faux ou impossible (la réalité contredit le plan) :
arrête, note l'écart précis dans le plan et escalade. Ne corrige pas le plan en silence.
