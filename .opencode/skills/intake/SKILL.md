---
name: intake
description: Qualifier une demande humaine avant d'en faire une US ou une PR (anti-flou, anti-doublon). Utiliser pour toute demande de correction, d'évolution ou tout « fix ça ».
---
# Qualifier une demande
1. **Le problème est-il constaté ?** Une demande vague (« fix ça », « ça marche pas ») → demande, en une fois :
   - type : erreur (message exact, logs) | comportement faux (attendu vs observé) | expérience utilisateur | perf (chiffre) ;
   - reproduction : étapes, environnement (dev/prod, version `git describe`) ;
   - impact : qui est gêné, depuis quand.
   Vérifie toi-même ce qui est vérifiable (lancer la commande, lire le log) avant de demander.
2. **Doublon ?** `node scripts/board.mjs search --q "<2-3 mots-clés>"` (plusieurs formulations) + `grep -ri` dans
   `docs/components/*/fex/` et `docs/lessons/`. Trouvé → rattache à l'US/FEX existante, ne crée rien.
3. **Dans la vision ?** Hors périmètre ou contraire aux non-objectifs → signale l'écart (règle « écart vision » d'AGENTS.md).
4. Seulement alors : US (`/spec`) ou correctif. Incident d'exploitation reproductible → FEX en plus (skill `ops-docs`).
