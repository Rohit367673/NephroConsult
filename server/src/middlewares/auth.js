export function requireAuth(rolesOrReq, maybeRes, maybeNext) {
  if (Array.isArray(rolesOrReq)) {
    const roles = rolesOrReq;
    return function roleAwareMiddleware(req, res, next) {
      // Support trusted admin email from header/query when cookies are blocked or partitioned by browser
      const adminEmails = ['rohit367673@gmail.com', 'suyambu54321@gmail.com', 'drs.ilangos@gmail.com', (process.env.OWNER_EMAIL || '').toLowerCase()].filter(Boolean);
      const headerEmail = (req.headers['x-user-email'] || req.query?.userEmail || '').toLowerCase().trim();

      if ((!req.session || !req.session.user) && headerEmail && adminEmails.includes(headerEmail)) {
        if (!req.session) req.session = {};
        req.session.user = { email: headerEmail, role: 'admin', name: 'Dr. Ilango / Admin' };
      }

      if (!req.session || !req.session.user) {
        console.log('❌ Auth failed: No session or user');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Auto-grant admin role for designated admin/owner emails
      const userEmail = (req.session.user.email || '').toLowerCase();
      if (adminEmails.includes(userEmail)) {
        req.session.user.role = 'admin';
      }

      if (!roles.includes(req.session.user.role)) {
        console.log('❌ Auth failed: Role check failed. User role:', req.session.user.role);
        return res.status(403).json({ error: 'Forbidden' });
      }
      return next();
    };
  }

  const req = rolesOrReq;
  const res = maybeRes;
  const next = maybeNext;

  // Support trusted admin email for default middleware too
  const adminEmails = ['rohit367673@gmail.com', 'suyambu54321@gmail.com', 'drs.ilangos@gmail.com', (process.env.OWNER_EMAIL || '').toLowerCase()].filter(Boolean);
  const headerEmail = (req.headers?.['x-user-email'] || req.query?.userEmail || '').toLowerCase().trim();

  if ((!req.session || !req.session.user) && headerEmail && adminEmails.includes(headerEmail)) {
    if (!req.session) req.session = {};
    req.session.user = { email: headerEmail, role: 'admin', name: 'Dr. Ilango / Admin' };
  }

  if (req.session && req.session.user) {
    return next();
  }

  // Debug logs to diagnose missing session on mobile
  try {
    console.log('❌ Auth failed (default)');
    console.log('🔐 Session exists:', !!req.session);
    console.log('🔐 Session ID:', req.sessionID);
    console.log('🔐 Session user:', req.session?.user);
    console.log('🍪 Cookie header:', req.headers?.cookie);
    console.log('🧭 Origin:', req.headers?.origin);
    console.log('🔗 Referer:', req.headers?.referer);
    console.log('📱 User-Agent:', req.headers?.['user-agent']);
    console.log('🌐 Host:', req.headers?.host);
  } catch (e) {
    // noop
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

export function requireRole(...roles) {
  return requireAuth(roles);
}
