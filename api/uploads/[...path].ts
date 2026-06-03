import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
  const strapiUrl = `https://api.hser.ren/uploads/${path}`;
  
  try {
    const upstream = await fetch(strapiUrl, {
      headers: {
        'Authorization': req.headers.authorization || '',
      },
    });
    
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Remove framing restrictions so Office Online Viewer can work
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    
    if (!upstream.ok) {
      // If /uploads fails through Worker, try direct Strapi
      const directUrl = `http://strapi.hser.ren:1337/uploads/${path}`;
      const direct = await fetch(directUrl);
      if (direct.ok) {
        const buf = Buffer.from(await direct.arrayBuffer());
        const ct = direct.headers.get('content-type') || 'application/octet-stream';
        res.setHeader('Content-Type', ct);
        res.status(200).send(buf);
        return;
      }
      res.status(upstream.status).json({ error: 'File not found' });
      return;
    }
    
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.status(200).send(buf);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
