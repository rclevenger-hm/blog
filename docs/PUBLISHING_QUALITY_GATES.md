# Publishing quality gates

The blog build already validates local links/assets and required page metadata before Pages deployment. This document defines the broader release contract so new posts do not gradually erode accessibility, performance, or navigability.

## Existing automated gates

Every deploy should continue to require:

- a successful Astro build;
- valid internal links and referenced local assets;
- title, description, viewport, canonical, and Open Graph metadata on built pages;
- canonical URLs that remain inside the configured blog site;
- unique canonical URLs across built pages;
- a pinned source revision for the embedded Antigravity Arcade demo.

## Next gates

Add deterministic checks in this order:

1. sitemap entries resolve to built public pages;
2. RSS entries point to canonical public post URLs;
3. images include useful alternate text or an explicit decorative treatment;
4. no positive `tabindex` or broken ARIA ID references are emitted;
5. built HTML/CSS/JS remains inside an explicit page-weight budget.

Avoid live external-link checks in the deployment critical path; third-party outages should not prevent publishing. External links can be audited on a scheduled advisory job instead.

## Release handling

A pull request should build and run quality checks without publishing. Only a validated push to `main` should configure/upload/deploy the Pages artifact. When a deploy fails, preserve the previous working Pages release rather than bypassing a failed quality gate.

## Content rule

Quality automation protects mechanics, not editorial judgment. It should not rewrite article prose or reject intentional voice/style choices unless they create a concrete accessibility, routing, or metadata defect.
