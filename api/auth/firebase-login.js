export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse request body manually for Vercel
    let body;
    if (req.body) {
      if (typeof req.body === 'string') {
        body = JSON.parse(req.body);
      } else if (typeof req.body === 'object') {
        body = req.body;
      }
    }

    if (!body || !body.idToken) {
      return res.status(400).json({ error: 'Missing idToken in request body' });
    }

    // Proxy to Render backend
    const upstreamUrl = 'https://nephroconsult.onrender.com/api/auth/firebase-login';

    const upstreamRes = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cookie': req.headers.cookie || '', // Important for session cookies
        'user-agent': req.headers['user-agent'] || '',
        'accept': req.headers.accept || '*/*',
        'origin': 'https://www.nephroconsultation.com', // Spoof origin to bypass CORS
        'referer': 'https://www.nephroconsultation.com/',
      },
      body: JSON.stringify(body),
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
    console.error('Firebase login proxy error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
