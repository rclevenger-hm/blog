import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';

const root = resolve('dist');
const base = '/blog';
let failed = false;

if (!existsSync(root)) {
  console.error('dist directory is missing; run the site build first');
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function cleanReference(value) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(trimmed)) return null;
  return trimmed.split('#', 1)[0].split('?', 1)[0];
}

function resolveCandidate(htmlFile, reference) {
  let path = reference;
  if (path === base || path === `${base}/`) return join(root, 'index.html');
  if (path.startsWith(`${base}/`)) path = path.slice(base.length + 1);
  else if (path.startsWith('/')) return null; // intentional site-root link outside this Pages project

  try {
    path = decodeURIComponent(path);
  } catch {
    // Keep the literal path; malformed URLs should fail the existence check below.
  }

  const candidate = resolve(dirname(htmlFile), path);
  if (!candidate.startsWith(root)) return null;
  return candidate;
}

function targetExists(candidate) {
  if (!candidate) return true;
  if (existsSync(candidate)) {
    if (!statSync(candidate).isDirectory()) return true;
    return existsSync(join(candidate, 'index.html'));
  }
  if (!extname(candidate) && existsSync(join(candidate, 'index.html'))) return true;
  return false;
}

for (const htmlFile of walk(root).filter((path) => path.endsWith('.html'))) {
  const html = readFileSync(htmlFile, 'utf8');
  const attributes = /\b(?:href|src)=["']([^"']+)["']/gi;
  for (const match of html.matchAll(attributes)) {
    const reference = cleanReference(match[1]);
    if (!reference) continue;
    const candidate = resolveCandidate(htmlFile, reference);
    if (!targetExists(candidate)) {
      console.error(`${relative(root, htmlFile)} references missing local asset/page: ${reference}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log('Built local links and assets resolve.');
