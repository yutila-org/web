---
layout: ../../../../layouts/StarioDocsLayout.astro
title: System Architecture
description: Overview of the Astro static site architecture and Cloudflare Pages edge deployment.
---

## Astro Static Site Architecture

This repository utilizes Astro as its primary static site generator (SSG), engineered for zero-bloat execution and optimal asset delivery. The architecture is strictly decoupled, focusing exclusively on file-based routing and static asset compilation, with zero runtime server logic.

### Directory Hierarchy

The repository structure follows a strict organizational pattern to enforce separation of concerns:

- `src/pages/`: Contains all file-based routes (`.astro` and `.md`).
- `src/layouts/`: Defines structural wrappers (e.g., `StarioDocsLayout.astro`).
- `public/`: Hosts static assets that bypass the bundler.
- `.github/workflows/`: Contains the ASTA (Automated Security Testing & Analysis) CI/CD pipelines.

<div class="callout info">
  <p><strong>Note:</strong> All components within `src/` must adhere to strict type-checking and zero-runtime-javascript rules unless explicitly required.</p>
</div>

## Edge Deployment

Deployment is orchestrated via Cloudflare Pages, configured entirely via code using `wrangler.jsonc`.

### Wrangler Configuration

The `wrangler.jsonc` file enforces compatibility constraints and domain mapping for the production edge:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "web",
  "compatibility_date": "2026-04-08",
  "compatibility_flags": ["nodejs_compat"],
  "routes": [
    {
      "pattern": "yutila.com",
      "custom_domain": true
    }
  ]
}
```

The site relies on `nodejs_compat` to enable Node.js API compatibility at the edge when necessary, though core functionality remains purely static.
