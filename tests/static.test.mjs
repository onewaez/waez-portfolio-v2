import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';

const dist = resolve(import.meta.dirname, '../dist');
const html = await readFile(resolve(dist, 'index.html'), 'utf8');
const basePath = process.env.BASE_PATH ?? '/';
const expectedSite = new URL(basePath, 'https://onewaez.github.io');

test('every local navigation target exists and document IDs are unique', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML or SVG IDs');
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(target), `Missing anchor: ${target}`);
});

test('projects contain native, accessible disclosure controls and server-rendered case studies', () => {
  const articles = [...html.matchAll(/<article\b[^>]*data-project[^>]*>([\s\S]*?)<\/article>/g)];
  assert.ok(articles.length >= 1);
  for (const [, article] of articles) {
    assert.match(article, /<details[^>]*>/);
    assert.match(article, /<summary>/);
    assert.match(article, /Read project/);
    assert.match(article, /class="prose"/);
    assert.match(article, /<h2[^>]*>/);
  }
});

test('page metadata and public links are ready for deployment', () => {
  assert.match(html, /<html lang="en"/);
  assert.match(html, /<title>Waez/);
  assert.match(html, /https:\/\/onewaez\.github\.io\//);
  assert.ok(html.includes(`rel="canonical" href="${expectedSite.href}"`));
  assert.ok(html.includes(new URL('social-card.jpg', expectedSite).href));
  assert.match(html, /mailto:onewaezwork@gmail\.com/);
  assert.doesNotMatch(html, /localhost|127\.0\.0\.1|\/Users\//);
  assert.doesNotMatch(html, /src="https?:[^\"]+\.js/);
});

test('all local referenced scripts, styles, and images exist in the static build', async () => {
  const paths = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)]
    .map(match => match[1])
    .filter(path => (path.startsWith('/') && !path.startsWith('//')) || path.startsWith('./'));
  assert.ok(paths.length >= 2);
  for (const path of paths) {
    const relativePath = path.startsWith('./') ? path.slice(2) : path.slice(basePath.length);
    if (!path.startsWith('./')) assert.ok(path.startsWith(basePath), `Asset bypasses deployment base: ${path}`);
    await access(resolve(dist, relativePath));
  }
  await access(resolve(dist, 'paper-grain.svg'));
  await access(resolve(dist, 'social-card.jpg'));
  await access(resolve(dist, '.nojekyll'));
  assert.ok((await readFile(resolve(dist, 'robots.txt'), 'utf8')).includes(new URL('sitemap.xml', expectedSite).href));
  assert.ok((await readFile(resolve(dist, 'sitemap.xml'), 'utf8')).includes(expectedSite.href));
});

test('deployment is manual and cannot be triggered by a source push', async () => {
  const workflow = await readFile(resolve(import.meta.dirname, '../.github/workflows/deploy.yml'), 'utf8');
  assert.match(workflow, /on:\s*\n\s+workflow_dispatch:/);
  assert.doesNotMatch(workflow, /^\s+(push|pull_request|schedule):/m);
});
