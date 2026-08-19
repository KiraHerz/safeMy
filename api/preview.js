export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const url = String(req.query.url || '');
  if (!/^https?:\/\//i.test(url)) return res.status(400).json({ error: 'Invalid URL' });
  try {
    const response = await fetch(url, { headers: { 'user-agent': 'SafeMy preview bot' } });
    const html = await response.text();
    const get = (name) => {
      const re = new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']*)`, 'i');
      const m = html.match(re); return m ? m[1].replace(/&amp;/g, '&') : '';
    };
    const title = get('og:title') || (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [,''])[1].trim();
    const description = get('og:description') || get('description');
    const image = get('og:image');
    const domain = new URL(url).hostname.replace(/^www\./, '');
    return res.status(200).json({ url, domain, title, description, image, provider: domain });
  } catch (error) {
    return res.status(200).json({ url, domain: new URL(url).hostname, title: '', description: '', image: '', fallback: true });
  }
}
