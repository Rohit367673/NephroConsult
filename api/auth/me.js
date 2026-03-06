export default async function handler(req, res) {
  // Proxy to Render backend
  const upstreamUrl = 'https://nephroconsult.onrender.com/api/auth/me';

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      method: req.method,
      headers: {
        'cookie': req.headers.cookie || '', // Important for session cookies
        'user-agent': req.headers['user-agent'] || '',
        'accept': req.headers.accept || '*/*',
      },
    });

    res.status(upstreamRes.status);

    // Get Set-Cookie headers properly
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

    // Copy non-cookie headers
    upstreamRes.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (lower === 'transfer-encoding') return;
      if (lower === 'content-encoding') return;
      if (lower === 'set-cookie') return;
      res.setHeader(key, value);
    });

    // Forward Set-Cookie headers for session management
    const cookies = getSetCookies(upstreamRes.headers);
    if (cookies.length) {
      res.setHeader('set-cookie', cookies);
    }

    const arrayBuf = await upstreamRes.arrayBuffer();
    res.send(Buffer.from(arrayBuf));
  } catch (err) {
    console.error('Auth me proxy error:', err);
    res.status(502).json({ error: 'API proxy failed' });
  }
}
