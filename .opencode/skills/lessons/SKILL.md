---
name: lessons
description: Consigner une erreur d'agent et sa leçon, et consulter les leçons existantes. Utiliser avant une tâche (lecture) et dès qu'une erreur d'agent est constatée (écriture).
---
# Leçons — `docs/lessons/`
Format, catégories et numérotation : `docs/lessons/README.md`.

**Lire** : avant une tâche, `grep -ril "<mots-clés de la tâche>" docs/lessons/` + la catégorie concernée.

**Écrire** dès qu'une erreur d'agent est constatée (DoD échouée par erreur évitable, review bloquante,
mauvaise hypothèse, conflit entre agents, correction de l'humain) :
1. Cherche une leçon existante. Trouvée → ajoute une ligne « Occurrences », ne duplique pas.
2. Sinon crée `LSN-NNNN-slug.md` dans la bonne catégorie + la ligne d'index du README.
3. Leçon = règle actionnable (« Toujours X avant Y »), pas un récit. Factuelle, sans blâme.
4. `node scripts/board.mjs event --type lesson --actor <toi> --us <id> --note "LSN-NNNN <titre>"`.
5. Notifie l'humain en une ligne (`Leçon ajoutée : LSN-NNNN — <titre>`). Pas de validation requise.
Leçon qui devrait devenir une règle permanente → propose-la à `/retro` (AGENTS.md ou skill).
