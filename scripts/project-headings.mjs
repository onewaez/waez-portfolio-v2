import { basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import GithubSlugger from 'github-slugger';

/** Unique heading anchors when multiple Markdown documents share one page. */
export function projectHeadings() {
  const slugger = new GithubSlugger();
  return {
    name: 'project-heading-anchors',
    element: {
      filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      visit(node, context) {
        const filename = context.fileURL ? fileURLToPath(context.fileURL) : 'project.md';
        const prefix = basename(filename, extname(filename));
        const slug = slugger.slug(context.textContent(node));
        context.setProperty(node, 'id', `${prefix}--${slug}`);
      },
    },
  };
}
