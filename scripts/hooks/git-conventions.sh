#!/usr/bin/env bash
# Conventions git (lefthook). Usage : git-conventions.sh msg <fichier> | branch
# Commits : Conventional Commits 1.0.0. Branches : <type>/<slug> vers dev, release|hotfix/x.y.z vers main.
set -uo pipefail
TYPES='feat|fix|docs|refactor|test|chore|ci|perf|build|style|revert'
fail(){ echo "✗ $1" >&2; exit 1; }
case "${1:-}" in
  msg)
    F="$2"; SUBJECT="$(head -1 "$F")"
    [[ "$SUBJECT" =~ ^(Merge|Revert\ \") ]] && exit 0
    [[ "$SUBJECT" =~ ^($TYPES)(\([a-z0-9._-]+\))?!?:\ [^A-Z].+[^.]$ ]] \
      || fail "sujet non conventionnel : « type(scope): description en minuscule, sans point final »"
    (( ${#SUBJECT} <= 72 )) || fail "sujet trop long (${#SUBJECT} > 72)"
    [ -z "$(sed -n 2p "$F" | grep -v '^#')" ] || fail "ligne 2 : doit être vide"
    BODY="$(sed '1,2d' "$F" | grep -v '^#')"
    (( $(echo "$BODY" | grep -c .) <= 15 )) || fail "corps trop long (> 15 lignes) : des puces courtes, pas de prose"
    exit 0;;
  branch)
    B="$(git branch --show-current)"
    [[ "$B" =~ ^(main|dev)$ ]] && exit 0
    [[ "$B" =~ ^($TYPES)/(US-[0-9]+-)?[a-z0-9]+(-[a-z0-9]+)*$ ]] && exit 0
    [[ "$B" =~ ^(release|hotfix)/[0-9]+\.[0-9]+\.[0-9]+$ ]] && exit 0
    fail "branche « $B » : <type>/[US-n-]slug-kebab ou release|hotfix/x.y.z";;
  *) echo "usage : git-conventions.sh msg <fichier> | branch" >&2; exit 2;;
esac
