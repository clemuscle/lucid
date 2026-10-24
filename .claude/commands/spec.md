---
description: Besoin → spec + US sur le board (exige une vision approuvée)
---
<!-- GÉNÉRÉ par scripts/ai-sync.mjs depuis .ai/ — ne pas éditer -->
Précondition : `node scripts/vision.mjs status` doit répondre APPROUVÉE. Sinon, arrête-toi et propose `/grill`.
Besoin : $ARGUMENTS (sinon : le prochain élément du « Périmètre MVP » de `docs/vision.md` sans spec).
0. Qualifie le besoin (skill `intake`) : problème constaté, pas de doublon (`board.mjs search`), dans la vision.
1. Tout ce qui est déjà tranché dans la vision s'applique sans redemander. Pose-moi uniquement les questions
   que la vision ne couvre pas (max 5 à la fois, skill `brainstorm`). Si la vision se contredit ou ne suffit pas, signale-le :
   la correction passe par `/grill`, pas par une supposition.
2. Délègue au sous-agent `po`, puis à `architect` (composants, dépendances, ADR, DEX, plan), avec des enveloppes complètes (skill `delegation`).
3. `node scripts/board.mjs render` et résumé : US créées, critères, choix d'architecture.
4. PORTE : attends que je valide le backlog. Après mon accord seulement :
   `node scripts/board.mjs ready --us <id> --actor architect` pour chaque US validée.
