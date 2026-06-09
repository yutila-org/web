<div align="center">
  <img src="public/favicon.svg" alt="Yutila Logo" width="60%" />
  <br />
  <p><img src="https://api.iconify.design/lucide:globe.svg?color=%233b82f6" width="18" align="center" /> Core web infrastructure and front-end application for the Yutila organization <img src="https://api.iconify.design/lucide:globe.svg?color=%233b82f6" width="18" align="center" /></p>
  <br />
  <a href="https://github.com/yutila-org/web/actions/workflows/stage1-pr.yml"><img src="https://img.shields.io/github/actions/workflow/status/yutila-org/web/stage1-pr.yml?style=for-the-badge&label=Secret%20Scan" alt="Secret Scan" /></a>
  <a href="https://github.com/yutila-org/web/actions/workflows/stage2-security.yml"><img src="https://img.shields.io/github/actions/workflow/status/yutila-org/web/stage2-security.yml?style=for-the-badge&label=CI%20Security" alt="CI Security" /></a>
</div>

<br />

<div align="center">
  <h2><img src="https://api.iconify.design/lucide:code.svg?color=%23f97316" width="28" align="center" /> Tech Stack</h2>
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=astro,svelte,ts,nodejs,pnpm,cloudflare,redis,githubactions" alt="Tech Stack" />
  </a>
</div>

<br />

## <img src="https://api.iconify.design/lucide:wrench.svg?color=%2322c55e" width="24" align="center" /> Local Development

Ensure Node.js `>=22.12.0` is installed.

```bash
# Install dependencies
pnpm install

# Start local development server at http://localhost:4321
pnpm run dev
```

## <img src="https://api.iconify.design/lucide:rocket.svg?color=%23ef4444" width="24" align="center" /> Build & Deployment

The application is deployed via Cloudflare Pages and Wrangler.

```bash
# Generate production build
pnpm run build

# Preview production build locally
pnpm run preview
```

## <img src="https://api.iconify.design/lucide:pen-tool.svg?color=%23eab308" width="24" align="center" /> Blog Feature

To add a new blog post, create a Markdown (`.md`) file in the `src/content/posts` directory. 

Each post must include the following YAML frontmatter:

```yaml
---
title: "Your Post Title"
publishDate: "YYYY-MM-DD"
author: "Acrilic" # Must be either "Acrilic" or "Spider-Kyle"
category: "Devlog" # Must be: "Devlog", "Publication", "Report", "Material", or "Resource"
---
```
Write your post content below the frontmatter using standard Markdown.

## <img src="https://api.iconify.design/lucide:network.svg?color=%23a855f7" width="24" align="center" /> Architecture

| Path / File | Description |
| :--- | :--- |
| [`src/`](src/) | Application source code, Astro components, layouts, and pages. |
| [`public/`](public/) | Static assets and decoupled integrations (e.g., Sveltia CMS). |
| `astro.config.mjs` | Astro build and integration configurations. |
| `wrangler.jsonc` | Cloudflare infrastructure bindings and runtime configuration. |