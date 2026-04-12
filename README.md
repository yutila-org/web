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

## 🚀 Development & Commands

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

## 🛡️ Edge Security Architecture

### HTTP Headers (`src/middleware.ts`)

Every response passes through our custom Astro middleware, which injects a strict baseline of security headers:

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

## 🔗 Extending the CSP

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
