export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const url = String(req.query.url || '');
  if (!/^https?:\/\//i.test(url)) return res.status(400).json({ error: 'Invalid URL' });
  const domain = new URL(url).hostname.replace(/^www\./, '');
  const pathTitle = decodeURIComponent(new URL(url).pathname.split('/').filter(Boolean).pop() || domain).replace(/[-_]+/g, ' ').replace(/\b\w/g, x => x.toUpperCase());
  const fromMeta = (html, key) => {
    const patterns = [
      new RegExp('<meta[^>]+(?:property|name)=["\\']' + key + '["\\'][^>]+content=["\\']([^"\\']*)', 'i'),
      new RegExp('<meta[^>]+content=["\\']([^"\\']*)["\\'][^>]+(?:property|name)=["\\']' + key + '["\\']', 'i')
    ];
    for (const re of patterns) { const m = html.match(re); if (m) return m[1].replace(/&amp;/g, '&'); }
    return '';
  };
  try {
    let title = '', description = '', image = '';
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 SafeMy/1.0' } });
      const html = await response.text();
      title = fromMeta(html, 'og:title') || (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [,''])[1].trim();
      description = fromMeta(html, 'og:description') || fromMeta(html, 'description');
      image = fromMeta(html, 'og:image');
    } catch {}
    if (!title || !image) {
      const r = await fetch('https://api.microlink.io?url=' + encodeURIComponent(url));
      const m = await r.json();
      title = title || m.data?.title || '';
      description = description || m.data?.description || '';
      image = image || m.data?.image?.url || m.data?.logo?.url || '';
    }
    return res.status(200).json({ url, domain, title: title || pathTitle, description, image, provider: domain });
  } catch {
    return res.status(200).json({ url, domain, title: pathTitle, description: '', image: '', fallback: true });
  }
}