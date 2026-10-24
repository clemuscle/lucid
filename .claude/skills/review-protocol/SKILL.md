---
name: review-protocol
description: Demander, faire et recevoir une review entre agents. Utiliser pour toute review de tâche complexe, d'US ou de PR/MR, côté auteur comme côté relecteur.
---
# Review
Le relecteur n'est JAMAIS l'auteur (ni le même agent, ni la même instance). Ton factuel : pas de compliment,
pas de remerciement, pas de défense, pas d'attaque.

## Demander (auteur)
La demande se suffit à elle-même : le relecteur n'a pas ton historique de session.
```
US/tâche : <id> — <objectif>.  Diff : git diff dev...<branche>  (ou fichiers listés)
Critères : <liste>.  Preuve : <sortie just check>.
Choix non évidents : <choix → raison>.  Points à vérifier en priorité : <liste>.
Hors périmètre volontaire : <liste>.
```
« Il faut le contexte de ma session » n'est pas acceptable : ce contexte doit être dans la demande.

## Faire (relecteur)
Lis → comprends → vérifie (exécute les tests, lis le code appelé) → évalue → réponds.
Chaque remarque : `[bloquant|important|mineur] fichier:ligne — constat — pourquoi (référence) — proposition`.
Références : test qui échoue, code existant qui fonctionne, doc de la stack, ADR, section de la vision.
**Bloquant (retour en dev)** si : casse une feature existante, contexte insuffisant pour juger, code incorrect pour
la stack, incompatible avec le legacy, conflit avec la vision ou un ADR.
Doute → question précise (« X est-il appelé avec null depuis Y ? »), pas une affirmation.
Verdict : APPROVE | CHANGES_REQUESTED + liste terse.

## Recevoir (auteur)
1. Reformule techniquement chaque remarque (ce qui est demandé, où). Pas clair → question précise, rien d'autre.
2. Vérifie avant d'implémenter : est-ce vrai pour ce code (reproduis, lis, teste) ?
3. Fondée → implémente, une remarque à la fois, test à l'appui. Non fondée → réponds avec la preuve technique.
4. Réponse : `<remarque> → corrigé (commit abc123) | refusé : <preuve> | question : <…>`.
Interdits : « Parfait ! », « Bien vu ! », implémenter sans vérifier, tout accepter pour clore.
