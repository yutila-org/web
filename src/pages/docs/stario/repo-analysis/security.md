---
layout: ../../../../layouts/StarioDocsLayout.astro
title: Security Pipeline
description: Comprehensive documentation of the ASTA GitHub Actions CI/CD stages and vulnerability scanning.
---

## Pipeline Overview

The CI/CD workflow follows a rigorous security-first model, known internally as ASTA. Every commit to the `main` branch or associated Pull Request triggers multiple isolated verification stages.

### Branch Protection

Branch protection rules mandate passing status checks from the CI pipeline prior to merging. Direct pushes to `main` are restricted, enforcing a strict peer-review and automated testing lifecycle.

## Automated Security Testing & Analysis (ASTA)

The pipeline is split into distinct sequential stages located in `.github/workflows/`:

- `stage1-pr.yml`: Executes secret scanning (Gitleaks) to detect exposed credentials or sensitive tokens in the diff.
- `stage2-ci.yml`: Runs primary CI builds and static vulnerability scanning.
- `stage3-dast.yml` & `dast.yml`: Dynamic application security testing.
- `deploy.yml`: Orchestrates deployment to Cloudflare Pages upon successful stage completion.

### Trivy & SBOM Scanning

`stage2-ci.yml` implements Aqua Security's Trivy to scan the filesystem and Infrastructure-as-Code definitions for vulnerabilities, halting the build on `CRITICAL` or `HIGH` findings.

Additionally, a Software Bill of Materials (SBOM) is automatically generated using Syft:

```yaml
- name: Syft SBOM
  uses: anchore/sbom-action@v0
  with:
    format: spdx-json
    output-file: sbom.spdx.json
```

<div class="callout info">
  <p><strong>Note:</strong> The generated SBOM is uploaded as an artifact with a 90-day retention policy to comply with software supply chain integrity standards.</p>
</div>
