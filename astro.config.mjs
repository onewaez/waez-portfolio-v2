import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { projectHeadings } from './scripts/project-headings.mjs';

export default defineConfig({
  site: 'https://onewaez.github.io',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: { processor: satteri({ hastPlugins: [projectHeadings] }), shikiConfig: { theme: 'github-light' } },
  devToolbar: { enabled: false },
});
