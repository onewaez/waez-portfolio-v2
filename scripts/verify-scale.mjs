import { cp, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const astroPackage = JSON.parse(await readFile(join(root, 'node_modules/astro/package.json'), 'utf8'));
const astroBin = join(root, 'node_modules/astro', typeof astroPackage.bin === 'string' ? astroPackage.bin : astroPackage.bin.astro);
const temporary = await mkdtemp(join(tmpdir(), 'waez-scale-'));
try {
  for (const entry of ['src', 'public', 'scripts', 'astro.config.mjs', 'tsconfig.json', 'package.json']) await cp(join(root, entry), join(temporary, entry), { recursive: true });
  await symlink(join(root, 'node_modules'), join(temporary, 'node_modules'), 'dir');
  const content = join(temporary, 'src/content/projects');
  const original = await readFile(join(content, 'fashion-classifier.md'), 'utf8');
  for (const count of [5, 20]) {
    for (let i = 2; i <= count; i++) {
      const fixture = original.replace('title: Fashion Classifier', `title: Scale fixture ${i}`).replace('order: 1', `order: ${i}`);
      await writeFile(join(content, `scale-fixture-${i}.md`), fixture);
    }
    const build = spawnSync(process.execPath, [astroBin, 'build'], { cwd: temporary, encoding: 'utf8', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } });
    assert.equal(build.status, 0, build.stderr + build.stdout);
    const html = await readFile(join(temporary, 'dist/index.html'), 'utf8');
    const articles = [...html.matchAll(/<article\b[^>]*id="([^"]+)"[^>]*data-project/g)].map(match => match[1]);
    assert.equal(articles.length, count);
    assert.equal(articles[0], 'fashion-classifier');
    assert.equal(articles.at(-1), `scale-fixture-${count}`);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, 'Duplicate IDs in expanded portfolio');
    assert.ok(html.indexOf('id="contact"') > html.indexOf(`id="scale-fixture-${count}"`));
    assert.match(html, new RegExp(`class="latest-link" href="#scale-fixture-${count}"`));
    console.log(`PASS: ${count} projects, correct order, unique IDs, working index, contact at the end.`);
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
