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

    upstreamRes.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (lower === 'transfer-encoding') return;
      if (lower === 'content-encoding') return;
      res.setHeader(key, value);
    });

    const setCookie = upstreamRes.headers.get('set-cookie');
    if (setCookie) {
      res.setHeader('set-cookie', setCookie);
    }

    const arrayBuf = await upstreamRes.arrayBuffer();
    res.send(Buffer.from(arrayBuf));
  } catch (err) {
    res.status(502).json({ error: 'API proxy failed' });
  }
}
