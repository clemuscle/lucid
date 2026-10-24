# socle v2 — démarrer un projet avec des agents IA, sans flou

Un socle à copier au début de chaque projet. Il impose un ordre simple :
**une vision claire d'abord, puis des US, puis du code**, avec des agents qui tournent
sur Claude Code ou OpenCode et des garde-fous qu'aucun agent ne peut contourner.

```
/grill ──► vision approuvée ──► /spec ──► backlog validé ──► /build ⇄ /review ──► done ──► merge
 (toi + agent)   (toi seul)      (po + architect)  (toi)       (piloté, ou `just loop` en sandbox)   (toi)
```

## Démarrage d'un projet
```bash
npx degit <toi>/socle-v2 mon-projet && cd mon-projet && git init
code .                      # → « Reopen in Container » (sandbox)
just ai-sync                # génère .claude/, .opencode/, docs/graph.md
claude                      # ou : opencode
```
1. **`/grill <ton idée>`** : l'agent t'interroge domaine par domaine (88 questions de base, plus les relances).
   Aucune supposition : une réponse floue est relancée, un « je ne sais pas » devient une décision,
   une hypothèse à tester ou une question non bloquante avec échéance. Le résultat : `docs/vision.md`.
2. **`just vision-approve`** dans ton terminal. Toi seul peux le faire : un agent est bloqué par le hook,
   et le script exige un terminal interactif. Si la vision change ensuite, elle doit être réapprouvée.
3. Configure `fmt / lint / typecheck / test` dans le `justfile` (fail-closed tant que ce n'est pas fait).
4. **`/spec`** : po et architect transforment le périmètre MVP en specs et US, sans redemander ce que la vision tranche déjà.

## Ensuite, au quotidien
| Commande | Rôle |
|---|---|
| `/grill` | démarrer, ou reprendre/corriger la vision |
| `/spec [besoin]` | spec + US (exige une vision approuvée), porte : validation du backlog |
| `/build [US-n]` | une US en TDD, `just check`, DoD, passage en review |
| `/review [US-n]` | qa + security en parallèle, done ou retour en dev |
| `/status` | reprise de session : vision, board, portes ouvertes, blocages |
| `/retro` | apprentissages → diffs proposés sur AGENTS.md et les skills |
| `/ship` | PR/MR vers `dev` (template, traçabilité agents/modèle/humain) |
| `/release` | `dev` → `main` : semver + changelog (`just release-notes`), tag humain |
| `just loop` | boucle autonome (devcontainer) : un agent neuf par itération |
| `just loop-dry` / `just loop-stop` | prévisualiser / arrêter proprement la boucle |
| `just board` | board HTML |

## Les 4 mécanismes
1. **Porte vision** — `scripts/vision.mjs` vérifie la vision : 23 sections obligatoires, aucun marqueur
   (`TODO`, `à définir`…), critères de succès et exigences chiffrés, au moins 3 non-objectifs,
   aucune question bloquante ouverte, hypothèses « à tester » avec leur méthode. Les formulations
   vagues (« rapide », « peut-être », « etc. »…) sont signalées et doivent être assumées explicitement à l'approbation.
   L'approbation enregistre l'empreinte SHA-256 de la vision : aucune US ne peut être créée sans elle.
2. **Graphe** — `.ai/graph.json` déclare les états, leurs responsables, les transitions et les portes.
   `board.mjs` l'applique (transitions, WIP), `loop.mjs` l'exécute, `docs/graph.md` l'affiche.
3. **Boucle** — `scripts/loop.mjs` : un nouveau processus d'agent par itération (contexte neuf, mémoire = fichiers).
   Finit ce qui est commencé avant de commencer autre chose, met une US en `blocked` avec preuve après
   2 échecs, s'arrête après 3 itérations sans progrès, au budget, ou à une porte humaine.
4. **Garde-fous** — `just check` (= DoD) via hook agent, lefthook et CI ; `guard.sh` bloque `--no-verify`,
   push forcé, `apply/destroy/delete` infra, écriture directe du board et approbation de la vision.

## Git, doc, apprentissage
- **Git flow** : `<type>/US-n-slug` → `dev` (env de test) → `release/x.y.z` → `main` + tag semver ; `hotfix/x.y.z` depuis `main`.
  Conventional Commits vérifiés par lefthook, push direct sur `dev`/`main` bloqué. Skill `git-workflow`.
- **Doc reprenable** : `docs/README.md` → par composant une DEX (exploitation), des FEX (incidents pas à pas) et ses ADR.
  La vision est archivée à chaque approbation (`docs/vision-history/`) ; la changer exige un ADR.
- **Leçons** : chaque erreur d'agent → `docs/lessons/<catégorie>/`, lue avant les tâches suivantes.

## Personnaliser
Édite uniquement `AGENTS.md` et `.ai/` (agents, commandes, skills, `config.json`, `graph.json`), puis `just ai-sync`.
`.claude/`, `.opencode/`, `opencode.json`, `docs/graph.md` et les templates de PR/MR (`.github/`, `.gitlab/`) sont générés.

## Crédits
Board agile, contrats JSON entre agents, rôles et portes humaines inspirés de
[clemuscle/agile-agents-socle](https://github.com/clemuscle/agile-agents-socle). Voir NOTICE.
