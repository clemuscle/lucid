# FEX-NNN — <symptôme observé, tel que vu par l'exploitant>

| Composant | Gravité | Dernière occurrence | Liens |
|---|---|---|---|
| <c> | bloquant / dégradé / mineur | AAAA-MM-JJ | DEX, US, PR |

## Symptômes
<!-- Ce qu'on voit : message d'erreur exact, alerte, comportement. C'est ce qu'on cherche avec grep. -->
```
<message d'erreur exact>
```

## Prérequis
<!-- Accès, outils, droits nécessaires avant de commencer. -->

## Diagnostic et résolution
<!-- Chaque étape : une action, la commande exacte, et un branchement selon la sortie.
     On ne passe jamais à l'étape suivante sans avoir lu la sortie. -->

### 1. <vérifier X>
```bash
<commande>
```
- Sortie `<A>` → étape 2.
- Sortie `<B>` → étape 4.
- Autre → escalade (voir fin).

### 2. <corriger Y>
```bash
<commande>
```
- Succès attendu : `<sortie>` → étape 3 (vérification).
- Échec → étape 4.

### 3. Vérifier le retour à la normale
```bash
<commande>
```

## Cause racine
<!-- Pourquoi ça arrive. Lien vers l'US de correction définitive si elle existe. -->

## Escalade
<!-- Si rien ne marche : qui, quoi fournir (logs, sorties des étapes). -->
