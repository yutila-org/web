# Yutila Web

![Private Repository](https://img.shields.io/badge/Private-Repository-red?style=for-the-badge&logo=github)
![Astro](https://img.shields.io/badge/Astro-000000?style=for-the-badge&logo=astro&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

> [!IMPORTANT]
> **Private Repository**
> This repository contains proprietary Yutila source code. Unauthorized distribution or copying is strictly prohibited.

Astro SSR application deployed natively to **Cloudflare Workers**. All security policies are enforced directly at the application edge, ensuring protection even on `.workers.dev` subdomains where the standard Cloudflare WAF is bypassed.

---

## Development and Commands

Run these commands from the root directory to manage the application lifecycle:

| Command | Action |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Build production site |
| `npm run preview` | Preview production build locally |

> [!WARNING]
> **WSL vs Windows Cross-Development Issue:**
> Because the `node_modules` directory is shared between your Windows host and the WSL environment, running `npm install` will download architecture-specific native bindings (like `@rollup/rollup-win32-x64-msvc` on Windows).
> 
> If you seamlessly switch to WSL and run `npm run dev`, you will likely encounter a `Cannot find module '@rollup/rollup-linux-x64-gnu'` error.
> 
> **The Fix:** If you switch environments, you must reset your dependencies. Run the following command **inside** your current active terminal environment (e.g. WSL):
> ```bash
> rm -rf node_modules package-lock.json && npm install
> ```

---

## Edge Security Architecture

### HTTP Headers (`src/middleware.ts`)

Every response passes through our custom Astro middleware, which injects a strict baseline of security headers. Headers are defined as a static `Record<string, string>` map and applied via an `Object.entries` loop. This trades negligible iteration overhead for a single-source-of-truth declaration that is trivial to extend.

To add a new header, append a key-value pair to the `securityHeaders` object. No other code changes are required.

| Header | Value | Purpose |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `X-Frame-Options` | `DENY` | Mitigates clickjacking attacks |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Protects origin information |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Enforces HTTPS connections |

#### Content-Security-Policy (CSP) Breakdown

| Directive | Value | Purpose |
|---|---|---|
| `default-src` | `'self'` | Blocks all external resource loading by default |
| `script-src` | `'self'` | Allows only first-party scripts |
| `style-src` | `'self' 'unsafe-inline'` | Allows first-party and Astro's scoped inline styles |
| `base-uri` | `'self'` | Prevents malicious `<base>` tag injection |
| `object-src` | `'none'` | Blocks Flash, Java, and other plugin embeds |
| `frame-ancestors` | `'none'` | Prevents the site from being framed |
| `upgrade-insecure-requests` | — | Forces HTTPS for all subresources |

### Session Cookies (`astro.config.mjs`)

Sessions use the `cloudflare-kv-binding` driver. The session cookie is hardened with strict boundaries:

| Property | Value | Enforcement |
|---|---|---|
| `httpOnly` | `true` | Inaccessible to client-side JavaScript |
| `secure` | `true` | Transmitted exclusively over HTTPS |
| `sameSite` | `strict` | Zero cross-site cookie transmission |
| `maxAge` | `86400` | Expires exactly 24 hours after creation |

---

## Extending the CSP

> [!CAUTION]
> **Never use wildcards in the CSP.** Always whitelist the exact, fully-qualified domain names you trust.

When integrating external third-party services, add the required domains to the relevant CSP directive inside `src/middleware.ts`. 

### Common Integration Examples

**Stripe:**
```csp
script-src 'self' https://js.stripe.com;
frame-src https://js.stripe.com;
```

**Google Fonts:**
```csp
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src https://fonts.gstatic.com;
```

**Plausible Analytics:**
```csp
script-src 'self' https://plausible.io;
connect-src 'self' https://plausible.io;
```

**External Images / CDN:**
```csp
img-src 'self' https://cdn.example.com;
```

---

## Maintainer Standards

### Code is Documentation

This codebase enforces a zero-comment policy. All inline comments, block comments, JSDoc annotations, HTML comments, and CSS comments have been removed. No new comments are to be introduced.

Domain logic must be expressed entirely through:

- **Strong typing** -- use explicit TypeScript interfaces and typed props for all component contracts.
- **Descriptive naming** -- variable, function, and component names must be self-documenting. Prefer verbose clarity over terse abbreviation.
- **Structural architecture** -- file placement, component boundaries, and data flow should make intent obvious without supplementary prose.

If a block of code requires a comment to be understood, that block must be refactored until the comment becomes unnecessary.

### Standard Components

Three reusable components under `src/components/` replace previously duplicated markup. All new pages and layouts must use these components instead of inlining equivalent markup.

| Component | Props | Usage |
|---|---|---|
| `BackLink.astro` | `href: string`, `label: string` | Renders a back-navigation link with an arrow SVG. Used in page headers and the markdown layout. |
| `PageHeader.astro` | `backHref: string`, `backLabel: string`, `title: string`, `subtitle?: string`, `subtitleClass?: string` | Renders the full page header block: `BackLink` + `<h1>` + optional subtitle. Accepts a `<slot>` for additional header content (see `roles.astro` for the slot pattern). |
| `ExternalArrow.astro` | None | Renders the external-link arrow icon (`channel-arrow`). Used inside channel/contact card links. |

`PageHeader` internally imports and renders `BackLink`; consuming pages do not need to import both.

### Data-Driven UI Pattern

Static, repetitive UI blocks must be refactored into frontmatter data arrays mapped to a single template. The canonical example is `src/pages/contact.astro`, where five channel cards are defined as an array of objects and rendered via `.map()`.

#### Structure

```
---
const items = [
  { href: "...", title: "...", icon: `<svg>...</svg>`, ... },
];
---

{items.map(item => (
  <a href={item.href}>
    <Fragment set:html={item.icon} />
    <h3>{item.title}</h3>
  </a>
))}
```

#### Requirements

- Each data object must have a consistent shape. Define a TypeScript `interface` or inline type when the array exceeds three entries.
- SVG markup stored as template literal strings is rendered via Astro's `set:html` directive. This bypasses Astro's default HTML escaping.
- `set:html` performs no validation. A malformed SVG string will silently produce broken markup with no build-time or runtime error. Verify all raw SVG content renders correctly in the dev server before committing.
- Boolean flags (e.g., `external: true`) control conditional attribute emission (`target`, `rel`). Pass `undefined` to omit an attribute entirely rather than passing an empty string.
