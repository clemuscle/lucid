---
description: Démarrage de projet — interrogatoire complet jusqu'à une vision claire, sans supposition
---
Utilise les skills `project-grill` (banque `references/questions.md`) et `brainstorm`. Sujet : $ARGUMENTS
- Projet existant (code, docs, git log) : lis-le d'abord et résume ce que tu en as compris avant toute question.
- Si `docs/vision.md` n'existe pas : copie `docs/vision.template.md` vers `docs/vision.md` et commence par le domaine 1.
- Si elle existe (session reprise ou vision modifiée) : lis-la, lance `node scripts/vision.mjs check`,
  résume en 5 lignes où on en est, puis reprends au premier domaine incomplet ou aux points en erreur.
- Changement d'une vision déjà approuvée : confirme d'abord avec moi que c'est un vrai changement (et pas une erreur
  de ma part), puis rédige l'ADR transverse du changement (skill `adr`) : l'approbation me demandera son chemin.
  L'ancienne version est déjà archivée dans `docs/vision-history/` ; la nouvelle remplace `docs/vision.md`.
Tu mets la vision à jour à la fin de chaque domaine. Tu ne lances JAMAIS `just vision-approve` : c'est l'humain.
Quand `node scripts/vision.mjs check` passe sans erreur, termine par le résumé et l'invitation à approuver.
