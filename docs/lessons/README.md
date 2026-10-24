# Leçons des agents

> À lire AVANT une tâche : la catégorie concernée (`grep -ri "<mot-clé>" docs/lessons/`).
> Écrites par l'agent qui constate l'erreur, sans validation humaine ; l'humain est notifié.
> Pas de doublon : cherche d'abord, complète la leçon existante (« Occurrences ») au lieu d'en créer une.

## Catégories (un dossier chacune)
| Dossier | Erreurs sur |
|---|---|
| `git/` | branches, commits, merge, conflits |
| `tests/` | tests faibles, faux verts, TDD non respecté |
| `stack/` | API, lib, langage, outil mal utilisé |
| `archi/` | contournement de la vision, d'un ADR, d'une frontière |
| `securite/` | secret, droit trop large, injection |
| `delegation/` | prompt de sous-agent flou, conflit de fichiers entre agents |
| `process/` | board, portes, DoD, workflow non respecté |
| `doc/` | DEX/FEX/ADR absents ou faux |

## Format : `docs/lessons/<catégorie>/LSN-NNNN-<slug>.md`
```markdown
# LSN-NNNN — <la leçon en une phrase impérative>
| Date | Session / US | Agent | Modèle | Harness |
|---|---|---|---|---|
## Erreur        <!-- ce que l'agent a fait -->
## Problème      <!-- conséquence observée (sortie, test, incident) ; « aucun » si détectée à temps -->
## Solution      <!-- ce qui a corrigé -->
## Leçon         <!-- règle actionnable pour la prochaine fois -->
## Occurrences   <!-- AAAA-MM-JJ US-n, une ligne par répétition -->
```
Numéro : `ls docs/lessons/*/ | grep -o 'LSN-[0-9]*' | sort | tail -1` + 1.

## Index
| ID | Catégorie | Leçon |
|---|---|---|
| [LSN-0001](process/LSN-0001-guard-lit-le-texte-de-la-commande.md) | process | Contenu citant une commande interdite → Write/Edit, pas de heredoc Bash |
