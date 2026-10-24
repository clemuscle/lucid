# Point d'entrée UNIQUE pour humains, agents, hooks et CI.
# FAIL-CLOSED : tant que les recettes de ta stack ne sont pas configurées, `just check` échoue.
set shell := ["bash", "-euo", "pipefail", "-c"]

default:
    @just --list

# --- À configurer pour ta stack (supprime le `exit 1`) ---
fmt:
    @echo "✗ just fmt non configuré (ex. gofmt -w . | pnpm prettier -w . | tofu fmt -recursive)"; exit 1
lint:
    @echo "✗ just lint non configuré (ex. golangci-lint run | pnpm eslint . | tflint --recursive)"; exit 1
typecheck:
    @echo "✗ just typecheck non configuré (ex. go vet ./... | pnpm tsc --noEmit)"; exit 1
test:
    @echo "✗ just test non configuré (ex. go test ./... | pnpm vitest run)"; exit 1

# --- Sécurité ---
scan:
    gitleaks detect --no-banner --redact
    trivy fs --scanners vuln,misconfig,secret --exit-code 1 --severity HIGH,CRITICAL --skip-dirs .worktrees .

# --- Gate unique = Definition of Done ---
check: vision ai-check board-check lint typecheck test scan

# --- Vision (porte d'entrée du projet) ---
# Vérifie la vision (structure, marqueurs, tableaux, questions bloquantes)
vision-check:
    node scripts/vision.mjs check
# Approuve la vision : HUMAIN UNIQUEMENT (terminal interactif requis)
vision-approve:
    node scripts/vision.mjs approve
# Échoue si la vision n'est pas approuvée ou a changé depuis
vision:
    node scripts/vision.mjs status

# --- Boucle autonome (devcontainer uniquement) ---
# Exécute le graphe sur les US ready, un agent neuf par itération : just loop / just loop 5
loop max="10":
    node scripts/loop.mjs --max {{max}}
# Montre ce que la boucle ferait, sans rien lancer
loop-dry:
    node scripts/loop.mjs --dry-run
# Arrête proprement la boucle à la fin de l'itération en cours
loop-stop:
    touch .loop-stop

# --- IA ---
ai-sync:
    node scripts/ai-sync.mjs
    node scripts/board.mjs graph
ai-check:
    node scripts/ai-sync.mjs --check
board-check:
    node scripts/board.mjs validate
board:
    node scripts/board.mjs render && echo "→ ouvre board/board.html"

# --- Git flow : feat|fix|…/* → dev → main (release) ---
# Prochaine version semver + changelog depuis les commits (n'écrit rien)
release-notes:
    node scripts/release.mjs
# Vérifie le nom de la branche courante
branch-check:
    bash scripts/hooks/git-conventions.sh branch

# Worktree manuel depuis dev (le mode auto crée les siens) : just wt feat US-3-export-csv
wt type name:
    git worktree add .worktrees/{{name}} -b {{type}}/{{name}} dev
wt-rm name:
    git worktree remove .worktrees/{{name}}
