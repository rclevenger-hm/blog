# Roger Clevenger — Writing

Personal engineering publication built with Astro and deployed on GitHub Pages.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Navigation regression checks

The primary links stay visible and wrap onto another row on narrow screens,
including when JavaScript is disabled. On phones the header scrolls with the
page so it does not cover the article while reading.

```bash
npx playwright install chromium
npm run build
npm run test:browser
```

The browser suite checks the built site at phone, tablet, and desktop widths,
including keyboard focus, current-page announcements, resizing, and browser
Back/Forward navigation. It starts its own loopback server and blocks external
requests. Set `CHROMIUM_PATH` to use an already-installed Chromium executable.
The Pages build runs these checks before deployment.
Each CI run also saves phone, desktop, and keyboard-focus screenshots as a
`navigation-screenshots` artifact for visual review.

## Publish an article

Create a Markdown file under `src/content/blog/`:

```yaml
---
title: "Post title"
description: "Short summary"
date: 2026-09-22
tags: ["SRE", "Reliability"]
featured: false
draft: false
readTime: "6 min read"
---
```

Push to `main` and GitHub Actions will build and deploy the site.


## Analytics

Cloudflare Web Analytics is enabled site-wide using the public site token supplied by Cloudflare.

The integration is cookie-free and provides visits/pageviews, referral sources, country, device type, browser/OS, and Core Web Vitals.
