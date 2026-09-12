import Parser from 'rss-parser'

const parser = new Parser()

export interface RssNewsItem {
  source: string
  title: string
  link: string
  pubDate: string
  contentSnippet: string
}

const VENEZUELA_NEWS_FEEDS: Array<{ name: string; url: string }> = [
  { name: 'El Nacional', url: 'https://www.elnacional.com/feed/' },
  { name: 'Efecto Cocuyo', url: 'https://efectococuyo.com/feed/' },
  { name: 'Prodavinci', url: 'https://prodavinci.com/feed/' },
]

export async function getVenezuelaNews(maxPerSource = 5): Promise<RssNewsItem[]> {
  try {
    const results = await Promise.allSettled(
      VENEZUELA_NEWS_FEEDS.map(async (source) => {
        // Some outlets (e.g. Prodavinci) 403 the default rss-parser agent.
        const response = await fetch(source.url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (compatible; VigilCrisis/1.0; +https://vigil.youthewave.org)',
          },
        })
        if (!response.ok) throw new Error(`RSS fetch failed: ${response.status}`)
        const feed = await parser.parseString(await response.text())
        return feed.items.slice(0, maxPerSource).map((item) => ({
          source: source.name,
          title: item.title ?? 'Sin título',
          link: item.link ?? '#',
          pubDate: item.pubDate ?? item.isoDate ?? '',
          contentSnippet: item.contentSnippet?.slice(0, 200) ?? '',
        }))
      })
    )

    return results
      .filter((r): r is PromiseFulfilledResult<RssNewsItem[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value)
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
  } catch {
    return []
  }
}
