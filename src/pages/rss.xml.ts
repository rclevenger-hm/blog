import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a,b) => b.data.date.valueOf() - a.data.date.valueOf());

  const site = context.site
    ? new URL(import.meta.env.BASE_URL, context.site)
    : new URL('https://rclevenger-hm.github.io/blog/');

  return rss({
    title: 'Roger Clevenger — Writing',
    description: 'Writing about reliability, systems, automation, engineering, and technical careers.',
    site,
    items: posts.map(post => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `posts/${post.id}/`
    }))
  });
}
