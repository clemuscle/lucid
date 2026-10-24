---
name: ops-docs
description: Écrire ou mettre à jour une DEX (dossier d'exploitation d'un composant) ou une FEX (fiche d'incident). Utiliser à la création d'un composant, à tout changement de config/version, et après tout incident reproductible.
---
# DEX / FEX
Templates : `docs/components/_template/`. Index : `docs/README.md`.

## DEX — `docs/components/<c>/dex.md` (une par composant)
But : un humain ou un agent qui découvre le composant sait l'exploiter sans demander.
- Mise à jour dans la MÊME PR que le changement (config, version, emplacement, dépendance).
- Versions exactes (pas « dernière »). Config : ce qu'il faut pour comprendre, pas un dump.
- Secrets : uniquement où ils sont (nom du secret, coffre), jamais la valeur.
- Liens : code, config, ADR, FEX, vision. Un fait n'est écrit qu'à un endroit ; ailleurs, un lien.

## FEX — `docs/components/<c>/fex/FEX-NNN-slug.md` (une par incident reproductible)
But : quelqu'un sous pression suit la procédure pas à pas sans réfléchir.
- Titre = symptôme tel qu'observé ; bloc « Symptômes » avec le message d'erreur exact (cherchable par grep).
- Chaque étape : une action, la commande exacte, puis un branchement par sortie possible (sortie A → étape n).
- Toujours une étape de vérification finale et une escalade.
- Ajoute la ligne dans « Incidents connus » de la DEX.
- Rejoue la procédure si possible (env dev) avant de la déclarer fiable ; sinon indique « non rejouée ».

Style : phrases courtes, tableaux, commandes. Pas d'introduction ni de conclusion.
