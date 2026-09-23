import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://rclevenger-hm.github.io',
  base: '/blog',
  output: 'static',
  trailingSlash: 'always'
});
