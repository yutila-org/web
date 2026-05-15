import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
    loader: glob({ base: './src/content/posts', pattern: '**/*.md' }),
    schema: z.object({
        title: z.string(),
        publishDate: z.coerce.date(),
        author: z.enum(['Acrilic', 'Spider-Kyle']),
        category: z.enum(['Devlog', 'Publication', 'Report', 'Material', 'Resource']),
    }),
});

export const collections = { posts };
