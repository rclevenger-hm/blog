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
