import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const validator = fileURLToPath(new URL('../scripts/check-built-metadata.mjs', import.meta.url));
const site = 'https://rclevenger-hm.github.io/blog/';

function page(canonical, ogUrl = canonical) {
  return `<!doctype html><html lang="en"><head><title>Example</title>
    <meta name="description" content="A useful description">
    <meta name="viewport" content="width=device-width">
    <meta property="og:title" content="Example">
    <meta property="og:description" content="A useful description">
    <meta property="og:url" content="${ogUrl}">
    <link rel="canonical" href="${canonical}"></head><body></body></html>`;
}

function validate(t, files) {
  const cwd = mkdtempSync(path.join(tmpdir(), 'blog-metadata-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  for (const [relative, html] of Object.entries(files)) {
    const file = path.join(cwd, 'dist', relative);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, html);
  }
  const result = spawnSync(process.execPath, [validator], { cwd, encoding: 'utf8' });
  assert.ifError(result.error);
  return result;
}

test('accepts home, nested, encoded, and explicit HTML routes; excludes bundled games', (t) => {
  const result = validate(t, {
    'index.html': page(site),
    'posts/example/index.html': page(`${site}posts/example/`),
    'posts/café notes/index.html': page(`${site}posts/caf%C3%A9%20notes/`),
    'standalone.html': page(`${site}standalone.html`),
    'games/demo/index.html': '<html><title>Third-party game</title></html>',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /valid for 4 site pages/);
});

for (const [label, canonical] of Object.entries({
  'nonexistent route': `${site}posts/missing/`,
  'another existing route': `${site}writing/`,
  'missing trailing slash': `${site}posts/example`,
  'index filename instead of public route': `${site}posts/example/index.html`,
  'query suffix': `${site}posts/example/?preview=1`,
  'fragment suffix': `${site}posts/example/#heading`,
  'outside site base': 'https://rclevenger-hm.github.io/posts/example/',
})) {
  test(`rejects a canonical with ${label}`, (t) => {
    const result = validate(t, {
      'posts/example/index.html': page(canonical),
      ...(label === 'another existing route' ? { 'writing/index.html': page(`${site}posts/example/`) } : {}),
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /posts\/example\/index\.html: canonical must match generated route/);
  });
}

test('still rejects Open Graph URL mismatch', (t) => {
  const result = validate(t, { 'index.html': page(site, `${site}wrong/`) });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /og:url does not match canonical/);
});

test('still rejects duplicate canonicals', (t) => {
  const result = validate(t, { 'index.html': page(site), 'writing/index.html': page(site) });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /canonical duplicates index.html/);
});

test('still rejects required metadata omissions', (t) => {
  const result = validate(t, { 'index.html': '<html><head></head></html>' });
  assert.equal(result.status, 1);
  for (const label of ['html lang', 'title', 'description', 'viewport', 'canonical', 'og:title', 'og:description', 'og:url']) {
    assert.ok(result.stderr.includes(`missing ${label}`), result.stderr);
  }
});

test('rejects a missing build', (t) => {
  const result = validate(t, {});
  assert.equal(result.status, 1);
  assert.match(result.stderr, /build the site before metadata validation/);
});
