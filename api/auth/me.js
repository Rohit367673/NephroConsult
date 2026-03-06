export default async function handler(req, res) {
  // Handle GET request for session check
  if (req.method === 'GET') {
    try {
      const upstreamUrl = 'https://nephroconsult.onrender.com/api/auth/me';
      const upstreamRes = await fetch(upstreamUrl, {
        method: 'GET',
        headers: {
          'cookie': req.headers.cookie || '',
          'user-agent': req.headers['user-agent'] || '',
          'accept': req.headers.accept || '*/*',
        },
      });
      res.status(upstreamRes.status);
      const getSetCookies = (hdrs) => {
        if (!hdrs) return [];
        if (typeof hdrs.getSetCookie === 'function') {
          const arr = hdrs.getSetCookie();
          return Array.isArray(arr) ? arr : [];
        }
        const combined = hdrs.get('set-cookie');
        if (!combined) return [];
        return combined
          .split(/,(?=\s*[^;\s]+=)/g)
          .map((s) => s.trim())
          .filter(Boolean);
      };
      upstreamRes.headers.forEach((value, key) => {
        const lower = key.toLowerCase();
        if (lower === 'transfer-encoding') return;
        if (lower === 'content-encoding') return;
        if (lower === 'set-cookie') return;
        res.setHeader(key, value);
      });
      const cookies = getSetCookies(upstreamRes.headers);
      if (cookies.length) {
        const rewrittenCookies = cookies.map(cookie => {
          return cookie.replace(/;\s*Domain=[^;]+/gi, '');
        });
        res.setHeader('set-cookie', rewrittenCookies);
      }
      const arrayBuf = await upstreamRes.arrayBuffer();
      res.send(Buffer.from(arrayBuf));
    } catch (err) {
      console.error('Auth me proxy error:', err);
      res.status(502).json({ error: 'API proxy failed' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
