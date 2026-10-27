import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';

const dist = resolve(import.meta.dirname, '../dist');
const html = await readFile(resolve(dist, 'index.html'), 'utf8');

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
  assert.match(html, /mailto:onewaezwork@gmail\.com/);
  assert.doesNotMatch(html, /localhost|127\.0\.0\.1|\/Users\//);
  assert.doesNotMatch(html, /src="https?:[^\"]+\.js/);
});

test('all local referenced scripts, styles, and images exist in the static build', async () => {
  const paths = [...html.matchAll(/(?:src|href)="((?:\.?\/)??(?:_astro\/[^"#]+|favicon\.svg))"/g)].map(match => match[1]);
  assert.ok(paths.length >= 2);
  for (const path of paths) await access(resolve(dist, path.replace(/^\.?\//, '')));
  await access(resolve(dist, 'paper-grain.svg'));
  await access(resolve(dist, 'social-card.jpg'));
  await access(resolve(dist, '.nojekyll'));
});
