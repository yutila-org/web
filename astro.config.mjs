import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { remarkAlert } from 'remark-github-blockquote-alert';

export default defineConfig({
    output: 'server',
    adapter: cloudflare({
        sessionKVBindingName: 'SESSIONS'
    }),
    markdown: {
        remarkPlugins: [remarkAlert]
    },
    session: {
        cookie: {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 86400
        }
    }
});