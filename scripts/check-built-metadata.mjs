import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const sitePrefix = 'https://rclevenger-hm.github.io/blog/';

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith('.html') ? [full] : [];
  });
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'));
  return match ? match[1].trim() : '';
}

function metaContent(html, attribute, value) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const tag = tags.find((candidate) => attr(candidate, attribute).toLowerCase() === value.toLowerCase());
  return tag ? attr(tag, 'content') : '';
}

function linkHref(html, rel) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  const tag = tags.find((candidate) => attr(candidate, 'rel').toLowerCase().split(/\s+/).includes(rel));
  return tag ? attr(tag, 'href') : '';
}

if (!fs.existsSync(root)) throw new Error('dist/ does not exist; build the site before metadata validation');

const pages = walk(root).filter((file) => {
  const relative = path.relative(root, file).split(path.sep).join('/');
  return !relative.startsWith('games/');
});
if (!pages.length) throw new Error('no built HTML pages found');

const canonicals = new Map();
const failures = [];

for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file).split(path.sep).join('/');
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '').trim();
  const lang = attr(html.match(/<html\b[^>]*>/i)?.[0] || '', 'lang');
  const description = metaContent(html, 'name', 'description');
  const viewport = metaContent(html, 'name', 'viewport');
  const ogTitle = metaContent(html, 'property', 'og:title');
  const ogDescription = metaContent(html, 'property', 'og:description');
  const ogUrl = metaContent(html, 'property', 'og:url');
  const canonical = linkHref(html, 'canonical');

  const required = [
    ['html lang', lang],
    ['title', title],
    ['description', description],
    ['viewport', viewport],
    ['canonical', canonical],
    ['og:title', ogTitle],
    ['og:description', ogDescription],
    ['og:url', ogUrl],
  ];
  for (const [label, value] of required) {
    if (!value) failures.push(`${relative}: missing ${label}`);
  }

  if (canonical && !canonical.startsWith(sitePrefix)) failures.push(`${relative}: canonical is outside ${sitePrefix}`);
  if (ogUrl && ogUrl !== canonical) failures.push(`${relative}: og:url does not match canonical`);
  if (canonical) {
    const previous = canonicals.get(canonical);
    if (previous) failures.push(`${relative}: canonical duplicates ${previous}`);
    else canonicals.set(canonical, relative);
  }
}

if (failures.length) {
  console.error('Built metadata validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Built metadata valid for ${pages.length} site pages.`);
