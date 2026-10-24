# Point d'entrée UNIQUE pour humains, agents, hooks et CI.
# Ce fichier appartient au PROJET. Les recettes du socle sont dans socle.just (ne pas éditer).
set shell := ["bash", "-euo", "pipefail", "-c"]
import 'socle.just'

default:
    @just --list

# --- À configurer pour ta stack (supprime le `exit 1`). FAIL-CLOSED : `just check` échoue d'ici là ---
fmt:
    @echo "✗ just fmt non configuré (ex. gofmt -w . | pnpm prettier -w . | tofu fmt -recursive)"; exit 1
lint:
    @echo "✗ just lint non configuré (ex. golangci-lint run | pnpm eslint . | tflint --recursive)"; exit 1
typecheck:
    @echo "✗ just typecheck non configuré (ex. go vet ./... | pnpm tsc --noEmit)"; exit 1
test:
    @echo "✗ just test non configuré (ex. go test ./... | pnpm vitest run)"; exit 1
