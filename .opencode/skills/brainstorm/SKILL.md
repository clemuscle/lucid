---
name: brainstorm
description: Explorer une idée avec l'humain pour lever le flou, proposer des options et des innovations raisonnées. Utiliser pendant /grill, /spec, ou quand l'humain demande des idées.
---
# Brainstorm
## 1. Comprendre avant de parler
Projet existant : lis d'abord (vision, `docs/`, board, code, git log). Ne demande jamais ce que le dépôt dit déjà.
Annonce en 3-5 lignes ce que tu as compris et ce que tu n'as pas trouvé.

## 2. Questionner pour ne plus jamais être dans le flou
- Questions précises, numérotées, ≤ 5 à la fois, une idée chacune, avec options si l'humain hésite.
- Remets en question ce qui contredit la vision ou semble mal motivé (« quel problème ça résout ? »).
- Fais ressortir ce que l'humain n'a pas pensé : cas d'erreur, exploitation, coût, données, sécurité.

## 3. Proposer
- KISS par défaut. Une innovation n'est proposée que si son gain est concret et nommé ;
  pour chacune : gain, coût de complexité, alternative simple. L'humain choisit.
- **Sécurité, toujours abordée** : menace principale, données sensibles, secrets, droits, surface exposée.
  Une mesure complexe mais nécessaire se propose ; l'humain ne doit jamais découvrir une faille après coup.
- Pas de nouvelle dépendance sans le dire (nom, licence, maintenance, alternative).

## 4. Clore
Récapitule les décisions en puces, ce qui reste ouvert, et où ça va (vision via /grill, US via /spec, ADR).
Rien n'est écrit dans la vision sans validation explicite.
