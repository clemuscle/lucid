# Graphe d'exécution

> Généré par `just graph` depuis `.ai/graph.json`. Ne pas éditer.

```mermaid
stateDiagram-v2
  [*] --> backlog: vision approuvée
  backlog: backlog (po)
  backlog --> ready
  backlog --> blocked
  ready: ready (architect)
  ready --> in_progress
  ready --> backlog
  ready --> blocked
  in_progress: in_progress (dev)
  in_progress --> review
  in_progress --> blocked
  review: review (qa + security-reviewer)
  review --> done
  review --> in_progress
  review --> blocked
  done: done (human)
  blocked: blocked (human)
  blocked --> backlog
  blocked --> ready
  blocked --> in_progress
  done --> [*]
```

| État | Responsable | Porte | Commande de la boucle |
|---|---|---|---|
| backlog | po | Definition of Ready : composant posé par l'architect + validation humaine du backlog |  |
| ready | architect |  |  |
| in_progress | dev | Definition of Done : just check | /build |
| review | qa + security-reviewer |  | /review |
| done | human | merge de la PR par l'humain |  |
| blocked | human |  |  |

Portes humaines : vision, backlog, architecture, blocked, merge. WIP : 3. Tentatives max par US : 2.
