import { env } from '../config.js';

// Enforce JSON content-type for mutating requests
export function requireJson(req, res, next) {
  const method = req.method.toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const ct = req.headers['content-type'] || '';
    if (!ct.toLowerCase().includes('application/json')) {
      return res.status(415).json({ error: 'Content-Type must be application/json' });
    }
  }
  next();
}

// Basic CSRF mitigation by verifying Origin/Referer matches CLIENT_URL for credentialed requests
export function verifyOrigin(req, res, next) {
  const method = req.method.toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return next();

  const origin = req.headers['origin'] || '';
  const referer = req.headers['referer'] || '';

  // Allow same-origin requests only; compare hostnames
  try {
    const allowedOrigins = String(env.CLIENT_URL || '').split(',').map(s => s.trim()).filter(Boolean);
    const allowedHosts = allowedOrigins.map((u) => {
      try { return new URL(u).hostname; } catch { return null; }
    }).filter(Boolean);
    const isLoopback = (h) => h === '127.0.0.1' || h === 'localhost';

    if (origin) {
      const o = new URL(origin);
      if (allowedHosts.includes(o.hostname) || (isLoopback(o.hostname) && allowedHosts.some(isLoopback))) return next();
    }
    if (referer) {
      const r = new URL(referer);
      if (allowedHosts.includes(r.hostname) || (isLoopback(r.hostname) && allowedHosts.some(isLoopback))) return next();
    }
  } catch {
    // fallthrough
  }

  return res.status(403).json({ error: 'Forbidden (origin check failed)' });
}
