---
name: diagrams
description: Quand et comment faire un schéma (doc ou réponse à l'humain). Utiliser avant d'expliquer une architecture, un flux ou un process.
---
# Schémas
Question : « un humain comprendrait-il mieux avec un visuel qu'avec du texte ? » Non → pas de schéma.

| Contexte | Format |
|---|---|
| Réponse dans le terminal | texte : tableau markdown, arbre, flèches ASCII (`──►`, `│`, `├─`) |
| Documentation | Mermaid dans le `.md` (rendu natif GitHub/GitLab, diffable) |
| Schéma libre impossible en Mermaid (exception) | Excalidraw : `.excalidraw` + export `.svg` à côté |

Règles : sobre, ≤ 12 nœuds, libellés de 1 à 4 mots, un schéma = une idée (flux OU composants OU séquence).
Le texte autour dit ce qu'il faut retenir ; le schéma ne répète pas le texte.
Types Mermaid : `flowchart` (composants, flux), `sequenceDiagram` (échanges), `stateDiagram-v2` (états).
