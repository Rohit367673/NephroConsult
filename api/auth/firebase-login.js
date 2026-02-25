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
    res.status(500).json({ error: 'Internal server error' });
  }
}
