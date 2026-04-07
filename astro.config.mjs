import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
    output: 'server',
    adapter: cloudflare({
        sessionKVBindingName: 'SESSIONS'
    }),
    session: {
        cookie: {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 86400
        }
    }
});