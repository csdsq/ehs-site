// Vercel Serverless Function: API proxy to Strapi backend
// Routes /api/strapi/* → https://api.hser.ren/*

const STRAPI_BASE = 'https://api.hser.ren';

export default async function handler(req, res) {
  const { path } = req.query;
  const pathMatch = Array.isArray(path) ? path.join('/') : (path || '');
  const strapiUrl = `${STRAPI_BASE}/api/${pathMatch}`;
  
  // Build query string from original request
  const qs = Object.entries(req.query)
    .filter(([k]) => k !== 'path')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  
  const fullUrl = qs ? `${strapiUrl}?${qs}` : strapiUrl;
  
  try {
    const upstream = await fetch(fullUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });
    
    const data = await upstream.text();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'public, s-maxage=60, max-age=60');
    
    res.status(upstream.status).send(data);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'Upstream proxy error', message: err.message });
  }
}
