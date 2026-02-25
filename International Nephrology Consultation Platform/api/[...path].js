import { Buffer } from 'node:buffer';

const UPSTREAM_BASE = 'https://nephroconsult.onrender.com/api';

export default async function handler(req, res) {
  try {
    const pathParam = req.query?.path;
    const restPath = Array.isArray(pathParam) ? pathParam.join('/') : String(pathParam || '');
    const upstreamUrl = `${UPSTREAM_BASE}/${restPath}`;

    const headers = { ...req.headers };
    delete headers.host;
    delete headers.connection;
    delete headers['content-length'];

    let body;
    const method = (req.method || 'GET').toUpperCase();
    if (method !== 'GET' && method !== 'HEAD') {
      if (req.body == null) {
        body = undefined;
      } else if (Buffer.isBuffer(req.body)) {
        body = req.body;
      } else if (typeof req.body === 'string') {
        body = req.body;
      } else {
        body = JSON.stringify(req.body);
        if (!headers['content-type']) headers['content-type'] = 'application/json';
      }
    }

    const upstreamRes = await fetch(upstreamUrl, {
      method,
      headers,
      body,
      redirect: 'manual',
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
      // Best-effort split: commas that are NOT part of an Expires attribute
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

    const cookies = getSetCookies(upstreamRes.headers);
    if (cookies.length) {
      // Important: set as array to preserve multiple Set-Cookie headers
      res.setHeader('set-cookie', cookies);
    }

    const arrayBuf = await upstreamRes.arrayBuffer();
    res.send(Buffer.from(arrayBuf));
  } catch (err) {
    res.status(502).json({ error: 'API proxy failed' });
  }
}
