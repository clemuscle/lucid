#!/usr/bin/env bash
# Sandbox : c'est ICI (et seulement ici) qu'on autorise l'agent en mode autonome.
set -euo pipefail
npm i -g @anthropic-ai/claude-code opencode-ai lefthook
curl -sSfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sudo sh -s -- -b /usr/local/bin
lefthook install
node scripts/ai-sync.mjs
echo "✓ devcontainer prêt. Lance : claude  ou  opencode"
