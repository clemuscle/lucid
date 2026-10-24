---
name: iac-conventions
description: Conventions Terraform/OpenTofu, Kubernetes, Docker et CI. Utiliser pour tout fichier .tf, manifest K8s, Helm, Dockerfile ou workflow CI.
---
# Conventions IaC
## Terraform / OpenTofu
- Providers épinglés. State distant chiffré. Pas de valeur sensible en `default`.
- Modules : `variables.tf`, `outputs.tf`, `versions.tf`, README via terraform-docs.
- `tofu fmt`, `tflint`, `trivy config` doivent passer.
## Kubernetes / Helm
- Toujours `resources.requests/limits`, `securityContext` non-root, `readOnlyRootFilesystem`.
- Images épinglées (digest ou tag immuable), jamais `latest`.
## Docker
- Multi-stage, image finale distroless/alpine, utilisateur non-root, `.dockerignore`.
## CI
- Actions épinglées par SHA. `permissions:` minimales. OIDC plutôt que secrets longue durée.
