---
layout: ../../../../layouts/StarioDocsLayout.astro
title: Content Engine
description: Explanation of file-based routing, frontmatter parsing, and the Netlify/Decap CMS integration.
---

## File-Based Routing

Astro's routing subsystem relies on the `src/pages/` directory to automatically map file structures to URL paths. Markdown (`.md`) and `.astro` files placed within this directory translate directly to functional routes.

<div class="callout info">
  <p><strong>Note:</strong> Route generation happens entirely at build time, ensuring zero server-side rendering latency.</p>
</div>

## Frontmatter Requirements

All Markdown-based documentation pages must declare a standardized YAML frontmatter block. This block maps the content to a designated layout and provides metadata for SEO and internal parsing.

### Structure

```yaml
---
layout: ../../../layouts/StarioDocsLayout.astro
title: Page Title
description: Concise technical description.
---
```

The `layout` parameter points to a specific `.astro` layout component (e.g., `StarioDocsLayout.astro`) which ingests the `title`, `description`, and raw markdown content into the site's design system.

## Netlify/Decap CMS Integration

To facilitate decoupled content management for non-engineering contributors, the repository integrates with Netlify/Decap CMS.

### Architecture

The CMS operates as a Single Page Application (SPA) located in the `/public/admin` directory (or functionally equivalent path). It uses a Git-backed backend to serialize changes made via the GUI directly into Markdown files and commits them to the repository.

<div class="callout warning">
  <p><strong>Warning:</strong> The CMS schema must remain strictly synchronized with the Astro content collections configuration. Altering frontmatter fields via code requires a corresponding update to the schema to prevent validation errors.</p>
</div>
