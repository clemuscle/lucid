---
name: adr
description: Format et emplacement des Architecture Decision Records. Utiliser quand une décision engage l'architecture, une dépendance, un changement d'outil (ex. docker → podman) ou un changement de vision.
---
# ADR
Template : `docs/components/_template/adr/0000-template.md`.

| Portée | Emplacement |
|---|---|
| Un composant | `docs/components/<c>/adr/NNNN-slug.md` |
| Plusieurs composants, vision, process | `docs/adr/NNNN-slug.md` |

- Numérotation par dossier : `ls <dossier> | grep -o '^[0-9]*' | sort | tail -1` + 1, sur 4 chiffres.
- Un ADR accepté ne se modifie plus. Changement de décision = nouvel ADR « Remplace NNNN » + ancien passé
  « Remplacé par NNNN ». L'historique explique le pourquoi.
- Toujours : lien vers la section de la vision qui justifie, alternatives rejetées avec la raison.
- Ajoute la ligne dans le tableau « Décisions » de la DEX du composant.
- Cas obligatoires : nouvelle dépendance tierce (après accord humain) ; changement d'une vision déjà approuvée
  (l'approbation humaine exige le chemin de cet ADR).
