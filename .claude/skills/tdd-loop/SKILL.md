---
name: tdd-loop
description: Boucle rouge-vert-refactor pour implémenter une tâche. Utiliser pour toute implémentation.
---
# Boucle TDD
1. **Rouge** : test qui échoue pour la bonne raison (lire le message d'erreur).
2. **Vert** : code minimal. Pas d'abstraction anticipée.
3. **Refactor** : seulement si les tests restent verts.
4. `just check` complet avant de déclarer la tâche finie.

Interdits : modifier l'assertion pour matcher le résultat ; `skip` silencieux ; attraper toutes les exceptions pour faire passer un test.
