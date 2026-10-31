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
  const xForwardedHost = req.headers['x-forwarded-host'] || '';
  const host = req.headers['host'] || '';

  // Allow same-origin requests; compare hostnames
  try {
    const allowedOrigins = String(env.CLIENT_URL || '').split(',').map(s => s.trim()).filter(Boolean);
    
    // Add common frontend domains for production
    const productionDomains = [
      'nephro-consult.vercel.app',
      'nephroconsult.vercel.app', 
      'nephro-consult-git-main-rohit367673s-projects.vercel.app',
      'nephro-consult-rohit367673s-projects.vercel.app',
      'nephroconsult.onrender.com'
    ];
    
    // Default allowed domains (mirror server CORS defaults)
    const defaultAllowed = [
      'https://www.nephroconsultation.com',
      'https://nephroconsultation.com',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];
    
    // Combine configured origins with known production domains and defaults
    const allAllowedOrigins = [
      ...allowedOrigins,
      ...productionDomains.map(d => `https://${d}`),
      ...defaultAllowed
    ];
    
    const allowedHosts = allAllowedOrigins.map((u) => {
      try { return new URL(u).hostname; } catch { return null; }
    }).filter(Boolean);
    
    const isLoopback = (h) => h === '127.0.0.1' || h === 'localhost';

    console.log('🔍 Origin check - Origin:', origin, 'Referer:', referer, 'X-Forwarded-Host:', xForwardedHost);

    if (origin) {
      const o = new URL(origin);
      if (allowedHosts.includes(o.hostname) || (isLoopback(o.hostname) && allowedHosts.some(isLoopback))) {
        return next();
      }
    }
    if (referer) {
      const r = new URL(referer);
      if (allowedHosts.includes(r.hostname) || (isLoopback(r.hostname) && allowedHosts.some(isLoopback))) {
        return next();
      }
    }
    if (xForwardedHost) {
      const xHost = xForwardedHost.split(':')[0].trim();
      if (allowedHosts.includes(xHost) || (isLoopback(xHost) && allowedHosts.some(isLoopback))) {
        return next();
      }
    }
    if (host) {
      const hHost = host.split(':')[0].trim();
      if (allowedHosts.includes(hHost) || (isLoopback(hHost) && allowedHosts.some(isLoopback))) {
        return next();
      }
    }
  } catch (error) {
    console.error('🔍 Origin check error:', error);
    // fallthrough
  }

  console.log('❌ Origin check failed');
  return res.status(403).json({ error: 'Forbidden (origin check failed)' });
}
