# Yutila Web

Astro SSR application deployed to Cloudflare Workers. All security is enforced at the application edge because Cloudflare dashboard WAF and security settings bypass `.workers.dev` subdomains.

## Security

### HTTP Headers (`src/middleware.ts`)

Every response passes through Astro middleware that injects the following headers:

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Content-Security-Policy` | See below |

**Content-Security-Policy breakdown:**

| Directive | Value | Purpose |
|---|---|---|
| `default-src` | `'self'` | Blocks all external resource loading by default |
| `script-src` | `'self'` | Only first-party scripts |
| `style-src` | `'self' 'unsafe-inline'` | First-party styles and Astro's scoped inline styles |
| `base-uri` | `'self'` | Prevents `<base>` tag injection |
| `object-src` | `'none'` | Blocks Flash, Java, and other plugin embeds |
| `frame-ancestors` | `'none'` | Prevents the site from being framed (clickjacking) |
| `upgrade-insecure-requests` | — | Forces HTTPS for all subresources |

### Session Cookies (`astro.config.mjs`)

Sessions use the `cloudflare-kv-binding` driver. The cookie is configured with strict boundaries:

| Property | Value | Purpose |
|---|---|---|
| `httpOnly` | `true` | Inaccessible to JavaScript |
| `secure` | `true` | Transmitted over HTTPS only |
| `sameSite` | `strict` | No cross-site cookie transmission |
| `maxAge` | `86400` | 24-hour expiry |

## Extending the CSP

When integrating external services, add the required domains to the relevant CSP directive in `src/middleware.ts`.

**Stripe example:**
```
script-src 'self' https://js.stripe.com;
frame-src https://js.stripe.com;
```

**Google Fonts example:**
```
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src https://fonts.gstatic.com;
```

**Analytics example (Plausible):**
```
script-src 'self' https://plausible.io;
connect-src 'self' https://plausible.io;
```

**External images / CDN example:**
```
img-src 'self' https://cdn.example.com;
```

Do not use wildcards. Whitelist only the exact origins you trust.

## Commands

| Command | Action |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Build production site |
| `npm run preview` | Preview production build locally |
