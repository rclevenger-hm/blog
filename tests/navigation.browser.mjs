import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const links = [
  ['Home', '/blog/'],
  ['Writing', '/blog/writing/'],
  ['Engineering', '/blog/engineering/'],
  ['Career', '/blog/career/'],
  ['Resume', '/blog/resume/'],
  ['Projects', '/blog/projects/'],
  ['About', '/blog/about/'],
];
const article = '/blog/posts/why-infrastructure-should-be-boring/';
const routes = [...links.map(([, path]) => path), article];
let browser;
let server;
let origin;

before(async () => {
  await stat(resolve(root, 'index.html'));
  browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (!pathname.startsWith('/blog/')) throw new Error('Unexpected base path');
      const file = resolve(root, pathname.slice('/blog/'.length), pathname.endsWith('/') ? 'index.html' : '');
      if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) throw new Error('Outside build directory');
      const body = await readFile(file);
      response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
      response.end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  origin = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await browser?.close();
  if (server?.listening) await new Promise(resolve => server.close(resolve));
});

async function openPage(t, options = {}) {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, ...options });
  t.after(() => page.close());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, [], 'no uncaught browser errors'));
  await page.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  return page;
}

async function checkNavigation(page, path) {
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  assert.equal(await nav.count(), 1, 'one accessible primary navigation landmark');
  for (const [label, href] of links) {
    const link = nav.getByRole('link', { name: label, exact: true });
    assert.equal(await link.isVisible(), true, `${label} is visible`);
    assert.equal(await link.getAttribute('href'), href);
    const box = await link.boundingBox();
    assert.ok(box && box.width >= 44 && box.height >= 44, `${label} has a 44px target`);
    assert.ok(box.x >= 0 && box.x + box.width <= page.viewportSize().width + 1, `${label} fits the viewport`);
    assert.equal(await link.evaluate(element => {
      const box = element.getBoundingClientRect();
      return element.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
    }), true, `${label} is not covered by another header element`);
    assert.equal(await link.getAttribute('aria-current'), href === path ? 'page' : null, `${label} current-page state`);
  }
  const header = await page.locator('.site-header').boundingBox();
  const navBox = await nav.boundingBox();
  assert.ok(navBox.y + navBox.height <= header.y + header.height, 'navigation stays inside the header');
  assert.equal(await page.locator('.header-inner').evaluate(element => element.scrollWidth <= element.clientWidth + 1), true, 'header has no horizontal overflow');
}

for (const width of [320, 375, 760]) {
  for (const path of routes) {
    test(`primary navigation is reachable on ${path} at ${width}px`, async t => {
      const page = await openPage(t, { viewport: { width, height: 812 } });
      const response = await page.goto(origin + path);
      assert.equal(response.status(), 200);
      await checkNavigation(page, path);
    });
  }
}

test('navigation survives breakpoint changes without a stale hidden state', async t => {
  const page = await openPage(t);
  await page.goto(origin + '/blog/');
  for (const width of [761, 820, 1050, 1051, 1280, 760, 320, 1280]) {
    await page.setViewportSize({ width, height: 812 });
    await checkNavigation(page, '/blog/');
  }
});

test('keyboard focus reaches every link and remains visible in both themes', async t => {
  const page = await openPage(t);
  for (const theme of ['light', 'dark']) {
    await page.goto(origin + '/blog/');
    await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.brand').evaluate(element => element === document.activeElement), true);
    for (const [label] of links) {
      await page.keyboard.press('Tab');
      const link = page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: label, exact: true });
      assert.equal(await link.evaluate(element => element === document.activeElement), true, `${label} follows the tab order`);
      assert.equal(await link.evaluate(element => {
        const style = getComputedStyle(element);
        return style.outlineStyle === 'solid' && parseFloat(style.outlineWidth) >= 2;
      }), true, `${label} has a visible focus ring in ${theme} mode`);
    }
    await page.keyboard.press('Tab');
    assert.equal(await page.getByRole('button', { name: 'Toggle dark mode' }).evaluate(element => element === document.activeElement), true);
  }
});

test('keyboard navigation preserves the destination and browser history', async t => {
  const page = await openPage(t);
  await page.goto(origin + article);
  const resume = page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Resume', exact: true });
  await resume.focus();
  await Promise.all([page.waitForURL(origin + '/blog/resume/'), page.keyboard.press('Enter')]);
  await checkNavigation(page, '/blog/resume/');
  await page.goBack();
  assert.equal(new URL(page.url()).pathname, article);
  await checkNavigation(page, article);
  await page.goForward();
  assert.equal(new URL(page.url()).pathname, '/blog/resume/');
  await checkNavigation(page, '/blog/resume/');
});

test('all primary destinations remain usable without JavaScript', async t => {
  const page = await openPage(t, { javaScriptEnabled: false });
  await page.goto(origin + article);
  for (const [label, path] of links) {
    await Promise.all([
      page.waitForURL(origin + path),
      page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: label, exact: true }).click(),
    ]);
    await checkNavigation(page, path);
  }
});

test('the phone header scrolls away instead of covering article text', async t => {
  const page = await openPage(t);
  await page.goto(origin + article);
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }));
  assert.ok(await page.locator('.site-header').evaluate(element => element.getBoundingClientRect().bottom < 0));
});
