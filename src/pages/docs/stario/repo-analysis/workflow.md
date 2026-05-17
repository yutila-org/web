---
layout: ../../../../layouts/StarioDocsLayout.astro
title: Developer Workflow
description: Required environment setup, execution commands, and edge simulation steps for local development.
---

## Environment Prerequisites

All engineering workstations must adhere to the following baseline dependencies to interact with the repository:

- **Node.js**: Version 18.x is strictly required to match the production build environment and pipeline configurations.
- **Package Manager**: standard `npm` is utilized for dependency resolution.

<div class="callout warning">
  <p><strong>Warning:</strong> Do not use `yarn` or `pnpm`. The repository relies exclusively on `package-lock.json` for deterministic dependency resolution and SBOM accuracy.</p>
</div>

## Execution Commands

The local development lifecycle is controlled via standard npm scripts defined in `package.json`:

- **Install Dependencies:** `npm ci` (Enforces strict `package-lock.json` adherence).
- **Development Server:** `npm run dev` (Starts the Astro development server on `localhost:4321` with Hot Module Replacement).
- **Production Build:** `npm run build` (Compiles the static site into the `dist/` directory).

## Wrangler Edge Simulation

To validate Cloudflare Pages routing and compatibility locally, the built output must be served using the Wrangler CLI.

### Simulation Steps

1. Execute the production build:
   ```bash
   npm run build
   ```
2. Run the Wrangler Pages simulator pointing to the output directory:
   ```bash
   npx wrangler pages dev dist
   ```

<div class="callout info">
  <p><strong>Note:</strong> This simulation strictly evaluates the output against the `nodejs_compat` compatibility flags and routing rules defined in `wrangler.jsonc`.</p>
</div>
