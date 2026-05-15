<div align="center">
  <img src="public/favicon.svg" alt="Yutila Logo" width="60%" />
  <br />
  <p><img src="https://api.iconify.design/lucide:globe.svg?color=%233b82f6" width="18" align="center" /> Core web infrastructure and front-end application for the Yutila organization. <img src="https://api.iconify.design/lucide:globe.svg?color=%233b82f6" width="18" align="center" /></p>
  <br />
  <a href="https://github.com/yutila-org/web/actions/workflows/stage1-pr.yml"><img src="https://img.shields.io/github/actions/workflow/status/yutila-org/web/stage1-pr.yml?style=for-the-badge&label=Stage%201%3A%20Secret%20Scan" alt="Stage 1: Secret Scan" /></a>
  <a href="https://github.com/yutila-org/web/actions/workflows/stage2-ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/yutila-org/web/stage2-ci.yml?style=for-the-badge&label=Stage%202%3A%20CI%20Security" alt="Stage 2: CI Security" /></a>
  <a href="https://github.com/yutila-org/web/actions/workflows/stage3-dast.yml"><img src="https://img.shields.io/github/actions/workflow/status/yutila-org/web/stage3-dast.yml?style=for-the-badge&label=Stage%203%3A%20DAST" alt="Stage 3: DAST" /></a>
  <a href="https://github.com/yutila-org/web/actions/workflows/dast.yml"><img src="https://img.shields.io/github/actions/workflow/status/yutila-org/web/dast.yml?style=for-the-badge&label=DAST" alt="DAST" /></a>
</div>

<br />

<div align="center">
  <h2><img src="https://api.iconify.design/lucide:code.svg?color=%23f97316" width="28" align="center" /> Tech Stack</h2>
  <img src="https://img.shields.io/badge/Astro-FF5D01?style=for-the-badge&logo=astro&logoColor=white" alt="Astro" />
  <img src="https://img.shields.io/badge/Svelte-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" alt="Svelte" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />

  <h2><img src="https://api.iconify.design/lucide:cloud.svg?color=%230ea5e9" width="28" align="center" /> Infrastructure</h2>
  <img src="https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions" />
</div>

<br />

## <img src="https://api.iconify.design/lucide:wrench.svg?color=%2322c55e" width="24" align="center" /> Local Development

Ensure Node.js `>=22.12.0` is installed.

```bash
# Install dependencies
npm install

# Start local development server at http://localhost:4321
npm run dev
```

## <img src="https://api.iconify.design/lucide:rocket.svg?color=%23ef4444" width="24" align="center" /> Build & Deployment

The application is deployed via Cloudflare Pages and Wrangler.

```bash
# Generate production build
npm run build

# Preview production build locally
npm run preview
```

## <img src="https://api.iconify.design/lucide:network.svg?color=%23a855f7" width="24" align="center" /> Architecture

| Path / File | Description |
| :--- | :--- |
| [`src/`](src/) | Application source code, Astro components, layouts, and pages. |
| [`public/`](public/) | Static assets and decoupled integrations (e.g., Sveltia CMS). |
| `astro.config.mjs` | Astro build and integration configurations. |
| `wrangler.jsonc` | Cloudflare infrastructure bindings and runtime configuration. |