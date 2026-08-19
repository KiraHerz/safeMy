export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const url = String(req.query.url || '');
  if (!/^https?:\/\//i.test(url)) return res.status(400).json({ error: 'Invalid URL' });
  try {
    const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 SafeMy/1.0' } });
    const html = await response.text();
    const meta = (key) => {
      const patterns = [
        new RegExp('<meta[^>]+(?:property|name)=["\\']' + key + '["\\'][^>]+content=["\\']([^"\\']*)', 'i'),
        new RegExp('<meta[^>]+content=["\\']([^"\\']*)["\\'][^>]+(?:property|name)=["\\']' + key + '["\\']', 'i')
      ];
      for (const re of patterns) { const m = html.match(re); if (m) return m[1].replace(/&amp;/g, '&'); }
      return '';
    };
    const domain = new URL(url).hostname.replace(/^www\./, '');
    const pathTitle = decodeURIComponent(new URL(url).pathname.split('/').filter(Boolean).pop() || domain).replace(/[-_]+/g, ' ').replace(/\b\w/g, x => x.toUpperCase());
    const title = meta('og:title') || (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [,''])[1].trim() || pathTitle;
    const description = meta('og:description') || meta('description');
    const image = meta('og:image');
    return res.status(200).json({ url, domain, title, description, image, provider: domain });
  } catch (error) {
    const domain = new URL(url).hostname.replace(/^www\./, '');
    return res.status(200).json({ url, domain, title: domain, description: '', image: '', fallback: true });
  }
}