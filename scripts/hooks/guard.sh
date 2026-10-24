#!/usr/bin/env bash
# PreToolUse(Bash) : bloque les commandes destructrices ou de contournement, quel que soit le mode.
CMD="$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).tool_input.command||"")}catch{}})')"
deny(){ echo "Bloqué par guard.sh : $1" >&2; exit 2; }
case "$CMD" in
  *"--no-verify"*)                deny "contournement des hooks git";;
  *"push --force"*|*"push -f"*)    deny "push forcé";;
  *"git push"*" main"*|*"git push"*" dev"*|*"git push"*":main"*|*"git push"*":dev"*)
                                   deny "push direct sur main/dev : passe par une PR/MR";;
  *"rm -rf /"*|*"rm -rf ~"*|*"rm -rf ."*) deny "suppression massive";;
  *"terraform apply"*|*"tofu apply"*|*"terraform destroy"*|*"tofu destroy"*|*"kubectl delete"*|*"helm uninstall"*)
                                   deny "action infra destructive : à lancer par l'humain";;
  *"vision-approve"*|*"vision.mjs approve"*|*".vision.lock"*)
                                   deny "l'approbation de la vision est réservée à l'humain";;
  *"board/backlog.json"*|*"board/board.json"*)
    [[ "$CMD" == *"scripts/board.mjs"* ]] || deny "écris le board via scripts/board.mjs";;
esac
exit 0
