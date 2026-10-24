---
name: delegation
description: Écrire le prompt d'un sous-agent et coordonner des agents en parallèle. Utiliser par l'orchestrateur avant TOUTE délégation.
---
# Déléguer
Un sous-agent n'a ni ton historique, ni ta réflexion. Les échecs viennent de : périmètre trop large, pas de
contexte, pas de contraintes, sortie vague. L'enveloppe (`board/schema/task-envelope.schema.json`) l'interdit.

## Le prompt
```
Rôle : <agent>#<n>. US : US-n. Plan : specs/NNN/plan.md tâche <k> (si existe).
Objectif : <une phrase, résultat observable>.
Contexte : <faits nécessaires> ; à lire : <chemins exacts : spec, DEX, ADR, leçons de la catégorie>.
Contraintes : <stack, versions, conventions, interdits>.
Fichiers possédés : <liste>. Tout autre fichier : lecture seule.
Hors périmètre : <ce qu'il ne doit PAS faire, même si tentant>.
Fini quand : <commande> → <sortie attendue>.
Retour : <format exact, ex. JSON report.schema.json, ≤ 20 lignes>.
```
- Un objectif par agent. S'il faut « et », c'est deux agents ou deux tâches.
- Les chemins plutôt que des copies ; une copie seulement si le fichier est long et qu'un extrait suffit.
- Pas de « fais au mieux », « si besoin », « etc. » : chaque mot vague est une supposition déléguée.
- Enregistre : `node scripts/board.mjs delegate --us <id> --to <agent#n> --payload '<enveloppe>'`.

## Parallèle
- Indépendance obligatoire : aucun fichier possédé en commun, aucune ressource partagée en écriture
  (même base, même port, même env). Sinon : séquentiel.
- Même feature : découpe par fichiers/couches, un worktree par agent, interfaces fixées AVANT (signature, schéma).
- Collaboration : `board.mjs event --type peer_message --actor <a> --target <b> --us <id> --note "..."`.
- Avant de lancer > 3 agents ou une tâche longue : préviens l'humain (coût) et attends l'accord (mode piloté).

## Retour
- Vérifie le rapport contre « Fini quand » (relance la commande). Un rapport n'est pas une preuve.
- Trace qui a fait quoi (US, PR) : `rôle#n → fichiers/tâche`.
