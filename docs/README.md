# Documentation — point d'entrée

Tu reprends le projet ? Lis dans cet ordre (≈ 30 min) :

| # | Quoi | Où | Pour |
|---|---|---|---|
| 1 | Vision (fait foi) | `vision.md` · historique `vision-history/` | intention, périmètre, non-objectifs |
| 2 | Architecture | `architecture.md` · ADR transverses `adr/` | composants, flux, choix globaux |
| 3 | Composants | `components/<composant>/` | exploiter et faire évoluer chaque composant |
| 4 | État du travail | `just board` · `node scripts/board.mjs status` | US en cours, blocages |
| 5 | Leçons | `lessons/README.md` | erreurs déjà commises, à ne pas répéter |
| 6 | Règles des agents | `../AGENTS.md` | workflow, git, interdits |

## Par composant : `components/<composant>/`
```
dex.md             Dossier d'EXploitation : comprendre, configurer, exploiter le composant
fex/FEX-NNN-*.md   Fiche d'EXploitation : un incident reproductible → procédure de résolution
adr/NNNN-*.md      décisions d'architecture propres au composant, dans l'ordre chronologique
```
Nouveau composant : `cp -r docs/components/_template docs/components/<composant>`.

## Où va quoi
| Type d'info | Emplacement |
|---|---|
| Décision qui touche plusieurs composants ou la vision | `adr/` |
| Décision propre à un composant | `components/<c>/adr/` |
| Version, config, emplacement d'un fichier, dépendance d'un composant | `components/<c>/dex.md` |
| Incident et sa résolution | `components/<c>/fex/` |
| Erreur d'agent et sa leçon | `lessons/<catégorie>/` |

Schémas : Mermaid dans le `.md`, seulement quand un visuel est plus clair qu'un texte (skill `diagrams`).
