export function requireAuth(rolesOrReq, maybeRes, maybeNext) {
  if (Array.isArray(rolesOrReq)) {
    const roles = rolesOrReq;
    return function roleAwareMiddleware(req, res, next) {
      console.log('🔐 Auth check - Session exists:', !!req.session);
      console.log('🔐 Auth check - Session user:', req.session?.user);
      console.log('🔐 Auth check - Required roles:', roles);
      console.log('🔐 Auth check - Session ID:', req.sessionID);
      
      if (!req.session || !req.session.user) {
        console.log('❌ Auth failed: No session or user');
        return res.status(401).json({ error: 'Unauthorized' });
      }
      if (!roles.includes(req.session.user.role)) {
        console.log('❌ Auth failed: Role check failed. User role:', req.session.user.role);
        return res.status(403).json({ error: 'Forbidden' });
      }
      console.log('✅ Auth passed for user:', req.session.user.email);
      return next();
    };
  }

  const req = rolesOrReq;
  const res = maybeRes;
  const next = maybeNext;

  if (req.session && req.session.user) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized' });
}

export function requireRole(...roles) {
  return requireAuth(roles);
}
