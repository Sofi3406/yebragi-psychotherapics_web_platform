import * as cheerio from 'cheerio';

// Always returns articles with { title, url, content? }
export async function extractPsychologyToday(html: string): Promise<{ title: string; url: string; content?: string }[]> {
  const $ = cheerio.load(html);
  const articles: { title: string; url: string; content?: string }[] = [];

  // Extract articles
  $('article, .article-item, .post-item, .entry').each((_, element) => {
    const $element = $(element);

    // Try selectors for title and link
    const titleElement = $element.find('h1, h2, h3, .title, .headline, a[href*="/articles/"]').first();
    const linkElement = $element.find('a[href*="/articles/"], a[href*="/us/blog/"]').first();

    if (titleElement.length && linkElement.length) {
      const title = titleElement.text().trim();
      let url = linkElement.attr('href');

      if (url && title) {
        if (url.startsWith('/')) {
          url = `https://www.psychologytoday.com${url}`;
        }
        articles.push({
          title,
          url,
          content: "", // always include content, even if blank
        });
      }
    }
  });

  // Fallback: look for any links that might be articles
  if (articles.length === 0) {
    $('a[href*="/articles/"], a[href*="/us/blog/"]').each((_, element) => {
      const $link = $(element);
      const url = $link.attr('href');
      const title = $link.text().trim();

      if (url && title && title.length > 10) {
        const fullUrl = url.startsWith('/') ? `https://www.psychologytoday.com${url}` : url;
        articles.push({ title, url: fullUrl, content: "" });
      }
    });
  }

  // Remove duplicates based on URL
  const uniqueArticles = articles.filter((article, index, self) => 
    index === self.findIndex(a => a.url === article.url)
  );

  return uniqueArticles.slice(0, 10);
}
