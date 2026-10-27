import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    order: z.number().int().positive(),
    year: z.number().int(),
    category: z.string(),
    summary: z.string(),
    contribution: z.string(),
    stack: z.array(z.string()),
    repository: z.url(),
    demo: z.url().optional(),
    presentation: z.enum(['network', 'image', 'editorial']).default('editorial'),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    caption: z.string().optional(),
    draft: z.boolean().default(false),
  }).refine((project) => project.presentation !== 'image' || Boolean(project.image && project.imageAlt), {
    message: 'Image projects need both image and imageAlt.',
  }),
});

export const collections = { projects };
