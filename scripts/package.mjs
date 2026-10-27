import { mkdir, copyFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const artifacts = resolve(root, 'artifacts');
await mkdir(artifacts, { recursive: true });
const archive = resolve(artifacts, 'waez-portfolio.zip');
await rm(archive, { force: true });
const result = spawnSync('python3', ['-c',
  'import pathlib,sys,zipfile; source=pathlib.Path(sys.argv[1]); archive=zipfile.ZipFile(sys.argv[2],"w",zipfile.ZIP_DEFLATED); [archive.write(p,p.relative_to(source)) for p in sorted(source.rglob("*")) if p.is_file()]; archive.close()',
  resolve(root, 'dist'), archive,
], { stdio: 'inherit' });
if (result.error || result.status !== 0) throw result.error ?? new Error('Could not create ZIP. Python 3 is required for packaging.');
await copyFile(resolve(root, 'HOSTING.md'), resolve(artifacts, 'HOSTING.md'));
console.log(`Ready to upload: ${archive}`);
