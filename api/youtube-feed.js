/**
 * Vercel Serverless Function: Fetches the live YouTube RSS XML feed
 * for TetherEarth (Channel ID: UC8HoRbn-c1aCRVjagTlr2vw) so newly uploaded
 * channel videos automatically appear on the website without needing an API key.
 */
export default async function handler(req, res) {
  const channelId = req.query?.channelId || 'UC8HoRbn-c1aCRVjagTlr2vw';
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(
    channelId
  )}`;

  try {
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TetherEarthBot/1.0)',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch YouTube feed' });
    }

    const xml = await response.text();
    const entries = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;

    while ((match = entryRegex.exec(xml)) !== null) {
      const block = match[1];
      const videoIdMatch = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const titleMatch = block.match(/<title>([^<]+)<\/title>/);
      const publishedMatch = block.match(/<published>([^<]+)<\/published>/);
      const descMatch = block.match(/<media:description>([\s\S]*?)<\/media:description>/);

      if (videoIdMatch && titleMatch) {
        const youtubeId = videoIdMatch[1].trim();
        const rawTitle = titleMatch[1]
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim();

        const rawDesc = descMatch
          ? descMatch[1]
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .trim()
          : '';

        entries.push({
          youtubeId,
          title: rawTitle,
          publishedAt: publishedMatch ? publishedMatch[1] : '',
          synopsis:
            rawDesc.split('\n').filter(Boolean)[0] ||
            'Official 4K Ultra HD wildlife documentary release from @TetherEarth.',
          thumbnailUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
        });
      }
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ channelId, videos: entries });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to parse YouTube channel feed' });
  }
}
