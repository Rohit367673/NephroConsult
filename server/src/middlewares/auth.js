export function requireAuth(rolesOrReq, maybeRes, maybeNext) {
  if (Array.isArray(rolesOrReq)) {
    const roles = rolesOrReq;
    return function roleAwareMiddleware(req, res, next) {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      if (!roles.includes(req.session.user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
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
