#!/usr/bin/env bash
# Definition of Done déterministe = `just check`. Fail-closed.
# Appelé par : hook SubagentStop (dev), /build, et manuellement.  Usage : dod-gate.sh [US-ID]
# Exit 2 = Claude Code bloque la fin du sous-agent et lui renvoie le message.
[ -t 0 ] || cat >/dev/null
US="${1:-$(git branch --show-current 2>/dev/null | grep -oE 'US-[0-9]+' | head -1)}"
ROOT="$(git rev-parse --show-toplevel)"
log(){ [ -n "$US" ] && node "$ROOT/scripts/board.mjs" event --type gate --actor dod --us "$US" --note "$1" >/dev/null 2>&1 || true; }
if (cd "$ROOT" && just check) >&2; then log "DoD ok"; exit 0
else log "DoD échouée"; echo "Porte DoD échouée : corrige jusqu'à ce que 'just check' passe. Ne rapporte pas 'done'." >&2; exit 2; fi
