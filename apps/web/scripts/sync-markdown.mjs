import { copyFileSync, mkdirSync, readdirSync, existsSync, rmSync } from 'fs';
import { join, dirname, relative, extname, basename } from 'path';

const contentDir = new URL('../content/docs', import.meta.url).pathname;
const publicDir = new URL('../public/docs', import.meta.url).pathname;

function getSlugs(file) {
  const dir = dirname(file);
  const name = basename(file, extname(file));
  const slugs = [];
  for (const seg of dir.split('/')) {
    if (seg.length > 0 && seg !== '.') slugs.push(seg);
  }
  if (name !== 'index') slugs.push(name);
  return slugs;
}

function walk(dir, baseDir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath, baseDir));
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      files.push(relative(baseDir, fullPath));
    }
  }
  return files;
}

// Clean and recreate public/docs
if (existsSync(publicDir)) {
  rmSync(publicDir, { recursive: true });
}
mkdirSync(publicDir, { recursive: true });

const files = walk(contentDir, contentDir);
for (const file of files) {
  const slugs = getSlugs(file);
  const outputName = slugs.length === 0 ? 'index.md' : slugs.join('/') + '.md';
  const outputPath = join(publicDir, outputName);

  mkdirSync(dirname(outputPath), { recursive: true });
  copyFileSync(join(contentDir, file), outputPath);
  console.log(`  ${outputName}`);
}

console.log(`\nSynced ${files.length} files to public/docs/`);
