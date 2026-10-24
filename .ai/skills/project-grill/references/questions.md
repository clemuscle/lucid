# Banque de questions du grill

`★` = obligatoire. Les autres : seulement si elles s'appliquent (dis pourquoi tu les sautes).
Chaque domaine indique la section de `docs/vision.md` qu'il remplit.

## 1. Intention → « Intention »
1. ★ En une phrase, que fait le projet, et pour qui ?
2. ★ Pourquoi ce projet existe-t-il ? Qu'est-ce qui t'a fait démarrer ?
3. ★ Quel est le type de projet : apprentissage, portfolio, outil perso, open source communautaire, produit commercial ? Si plusieurs, lequel prime en cas de conflit ?
4. ★ Pourquoi maintenant ?
5. Qu'est-ce qui existe déjà (concurrents, outils, scripts internes) ? Pourquoi ne pas les utiliser ou y contribuer ?
6. ★ Quelle est ta différence en une phrase, face à l'existant le plus proche ?
7. Si le projet ne devait réussir qu'une seule chose, laquelle ?

## 2. Utilisateurs et problème → « Utilisateurs », « Problème »
8. ★ Qui sont les utilisateurs ? Décris 1 à 3 personas : rôle, contexte, niveau technique.
9. ★ Lequel est le persona principal, celui pour qui on arbitre ?
10. ★ Quel problème précis vit ce persona aujourd'hui ? Raconte une situation concrète récente.
11. ★ Comment le résout-il aujourd'hui (contournement actuel) ? Qu'est-ce que ça lui coûte (temps, erreurs, argent) ?
12. Y a-t-il des utilisateurs secondaires ou indirects (admin, ops, auditeur, client final) ?
13. Qui n'est explicitement **pas** utilisateur ?
14. As-tu parlé à de vrais utilisateurs ? Si non, comment valideras-tu le problème ?
15. Combien d'utilisateurs visés au lancement ? À 12 mois ?

## 3. Succès → « Critères de succès »
16. ★ À quoi reconnais-tu que le projet a réussi ? Donne 2 à 5 critères mesurables (métrique, cible, méthode de mesure).
17. ★ À quelle date fais-tu le bilan ?
18. ★ Qu'est-ce qui te ferait arrêter le projet (critère d'abandon) ?
19. Pour le portfolio : qu'est-ce qu'un recruteur doit voir ou comprendre en 2 minutes ?
20. Quelle démo concrète montrerais-tu à la fin du MVP ?

## 4. Périmètre → « Périmètre MVP », « Non-objectifs », « Après le MVP »
21. ★ Liste les fonctionnalités du MVP. Pour chacune : pourquoi est-elle indispensable au MVP ?
22. ★ Le MVP le plus petit qui reste utile : que retires-tu encore de la liste ?
23. ★ Non-objectifs : qu'est-ce que le projet ne fera **pas**, même si c'est tentant ? Au moins 3.
24. ★ Qu'est-ce qui est repoussé après le MVP (v2) ?
25. Y a-t-il une fonctionnalité « wow » qui justifie le projet ? Est-elle dans le MVP ?

## 5. Parcours clés → « Parcours clés »
26. ★ Décris les 3 à 5 parcours principaux, étape par étape, du point de vue du persona principal.
27. ★ Pour chaque parcours : quel est le déclencheur, et quel est le résultat observable à la fin ?
28. ★ Quels cas d'erreur importants pour chaque parcours (ce qui se passe quand ça rate) ?
29. Quelles interfaces : CLI, API, web UI, GitOps (fichiers dans un repo), chat, autre ? Laquelle est prioritaire ?
30. Y a-t-il des parcours d'administration (installer, configurer, mettre à jour, désinstaller) ?

## 6. Domaine et données → « Domaine et données », « Glossaire »
31. ★ Quels sont les objets métier principaux (entités) et leurs relations ?
32. ★ Définis chaque terme métier que tu emploies (ils iront dans le glossaire).
33. ★ D'où viennent les données, qui les crée, qui les modifie, qui les supprime ?
34. ★ Les données sont-elles sensibles (secrets, credentials cloud, données personnelles) ? Lesquelles ?
35. Volumes attendus : nombre d'objets, taille, croissance ?
36. Combien de temps garde-t-on les données ? Faut-il un historique ou un audit des changements ?
37. Données personnelles → quelle base légale RGPD, quels droits (export, suppression) ?
38. Faut-il importer depuis un existant, ou exporter vers d'autres outils ?

## 7. Intégrations → « Intégrations »
39. ★ Avec quels systèmes externes le projet doit-il interagir (cloud providers, Git, CI, K8s, IdP, Terraform, Slack…) ? Lesquels dans le MVP ?
40. ★ Pour chaque intégration : lecture seule ou écriture ? Avec quels droits minimaux ?
41. Que se passe-t-il quand un système externe est indisponible ?
42. Y a-t-il des APIs, formats ou standards imposés (OpenAPI, OCI, CloudEvents, Backstage catalog…) ?

## 8. Contraintes → « Contraintes »
43. ★ Temps disponible : combien d'heures par semaine, pendant combien de temps ?
44. ★ Échéance ferme ? Laquelle et pourquoi ?
45. ★ Budget mensuel maximum : infra, modèles IA, services ?
46. ★ Technologies imposées (par toi, un employeur, une cible) ? Technologies interdites ?
47. ★ Technologies que tu veux apprendre ou démontrer ? Est-ce un objectif ou une contrainte ?
48. Compétences : sur quelles parties te sens-tu solide, sur lesquelles es-tu débutant ?
49. Licence visée (MIT, Apache-2.0, AGPL…) ? Contraintes de licence sur les dépendances ?
50. Contraintes d'environnement : on-prem, air-gapped, cloud précis, souveraineté ?

## 9. Qualités non fonctionnelles → « Exigences non fonctionnelles »
Pour chaque exigence retenue : un chiffre et une méthode de mesure.
51. ★ Performance : quels temps de réponse sur quelles opérations ?
52. ★ Disponibilité : quel niveau est nécessaire ? Que se passe-t-il pour l'utilisateur en cas de panne ?
53. ★ Multi-utilisateur, multi-équipe, multi-tenant ? Isolation entre eux ?
54. Scalabilité : quelle charge cible (utilisateurs simultanés, ressources gérées) ?
55. Accessibilité, internationalisation, langues ?
56. Compatibilité : OS, navigateurs, versions de K8s / Terraform / cloud supportées ?
57. Maintenabilité : qui maintiendra le code dans 1 an ? Couverture de tests visée ?

## 10. Sécurité → « Sécurité »
58. ★ Authentification : qui se connecte, comment (SSO/OIDC, tokens, local) ?
59. ★ Autorisation : quels rôles, qui peut faire quoi ?
60. ★ Quels secrets le système manipule-t-il ? Où sont-ils stockés, comment sont-ils renouvelés ?
61. ★ Quelle est la pire chose qu'un attaquant pourrait faire avec ce système ? (menace principale)
62. Le système exécute-t-il des actions avec des droits élevés (déployer, détruire de l'infra) ? Avec quelles protections ?
63. Exigences de conformité (ISO 27001, SOC 2, HDS…) ?
64. Audit : faut-il tracer qui a fait quoi ?

## 11. Exploitation → « Exploitation »
65. ★ Où tourne le projet (laptop, VM, Kubernetes, SaaS) ? Qui l'installe ?
66. ★ Combien d'environnements (dev, staging, prod) ?
67. ★ Comment se fait une mise à jour ? Un retour arrière ?
68. Sauvegardes et restauration : quoi, à quelle fréquence, testées comment ?
69. Quelle observabilité minimale (logs, métriques, health checks) ?
70. Coût d'exploitation cible par mois ?

## 12. Travail avec l'IA → « Mode de travail »
71. ★ Quelles parties délègues-tu aux agents, lesquelles gardes-tu (spec, archi, review, sécurité, code critique) ?
72. ★ Quelles portes humaines veux-tu (validation de backlog, archi, démo, merge) ?
73. ★ Quel niveau d'autonomie : piloté uniquement, ou boucle autonome en sandbox ? Avec quel budget par boucle ?
74. ★ Quels modèles ou abonnements as-tu (et donc quelles limites) ?
75. Quel rythme : une itération = combien de temps, combien d'US ?

## 13. Open source et portfolio → « Diffusion »
76. ★ Le repo sera-t-il public ? Dès le début ou plus tard ?
77. Contributions externes acceptées ? Avec quelles règles (CONTRIBUTING, CLA, code de conduite) ?
78. Documentation attendue : README, docs utilisateur, docs d'architecture, démo vidéo ?
79. Comment distribuer : binaire, image OCI, chart Helm, npm, SaaS ?
80. Comment comptes-tu faire connaître le projet ?

## 14. Risques et inconnues → « Risques », « Hypothèses »
81. ★ Quelles sont les 3 choses dont tu es le moins sûr ?
82. ★ Quelle partie est techniquement la plus risquée ? Faut-il un spike avant de s'engager ?
83. ★ Quelles hypothèses fais-tu sans les avoir vérifiées ? Comment les tester ?
84. ★ Dépendances critiques (projet tiers, API, personne) : que se passe-t-il si l'une disparaît ?
85. Qu'est-ce qui pourrait te faire perdre la motivation ? Comment l'éviter ?

## Passe finale (obligatoire)
86. ★ Contradictions détectées : présente-les une par une et fais trancher.
87. ★ Pre-mortem : « dans 6 mois le projet a échoué, pourquoi ? » Au moins 3 causes, chacune avec sa parade.
88. ★ Relecture : « Si un dev lisait uniquement cette vision, que pourrait-il mal comprendre ? »
