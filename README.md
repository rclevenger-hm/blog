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

The site supports Cloudflare Web Analytics without cookies or a consent banner.

1. In Cloudflare Web Analytics, add the hostname `rclevenger-hm.github.io`.
2. Copy the site token from the generated JavaScript snippet.
3. In this repository, open **Settings → Secrets and variables → Actions → Variables**.
4. Create a repository variable named `CLOUDFLARE_WEB_ANALYTICS_TOKEN` containing the Cloudflare site token.
5. Re-run the Pages workflow or push a commit to `main`.

The token is injected at build time as `PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`. If the variable is absent, no analytics script is emitted.

Cloudflare Web Analytics provides visits/pageviews, referral sources, country, device type, browser/OS, and Core Web Vitals.
