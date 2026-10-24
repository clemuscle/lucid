---
name: spec-writing
description: Comment écrire une spec de feature exploitable par des agents (EARS, périmètre, non-objectifs). Utiliser pour toute création ou modification de spec.md.
---
# Écrire une spec
Une bonne spec fixe : objectif, périmètre, **non-objectifs**, contraintes, critères d'acceptation vérifiables.

## Critères d'acceptation au format EARS
- Ubiquitaire : `Le système DOIT <réponse>.`
- Événement : `QUAND <déclencheur>, le système DOIT <réponse>.`
- État : `TANT QUE <état>, le système DOIT <réponse>.`
- Erreur : `SI <condition indésirable>, ALORS le système DOIT <réponse>.`

Chaque critère doit être testable par une commande. Sinon, ce n'est pas un critère.
Ne jamais décrire le COMMENT dans la spec (ça va dans plan.md).
