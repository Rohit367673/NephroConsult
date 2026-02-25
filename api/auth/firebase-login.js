export default async function handler(req, res) {
  // Proxy to Render backend
  const upstreamUrl = 'https://nephroconsult.onrender.com/api/auth/firebase-login';

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: 'nephroconsult.onrender.com',
        cookie: req.headers.cookie || '', // Important for session cookies
        'content-type': req.headers['content-type'] || 'application/json',
      },
      body: req.body,
      credentials: 'include', // Include cookies
    });

    res.status(upstreamRes.status);

    // Copy headers, especially Set-Cookie for session management
    upstreamRes.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'transfer-encoding' && key.toLowerCase() !== 'content-encoding') {
        res.setHeader(key, value);
      }
    });

    const arrayBuf = await upstreamRes.arrayBuffer();
    res.send(Buffer.from(arrayBuf));
  } catch (err) {
    console.error('Firebase login proxy error:', err);
    res.status(502).json({ error: 'API proxy failed' });
  }
}
