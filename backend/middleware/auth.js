import jwt from 'jsonwebtoken';

const getConfig = () => ({
  secret: process.env.JWT_SECRET || 'velocestock-insecure-secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '12h',
});

const buildUserPayload = (user) => ({
  sub: user.id,
  username: user.username,
  role: user.role,
  displayName: user.displayName,
});

export const signToken = (user) => {
  const { secret, expiresIn } = getConfig();
  return jwt.sign(buildUserPayload(user), secret, { expiresIn });
};

export const attachUser = (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (!token || (scheme || '').toLowerCase() !== 'bearer') {
    next();
    return;
  }

  const { secret } = getConfig();

  try {
    const decoded = jwt.verify(token, secret);
    req.user = {
      id: decoded.sub,
      username: decoded.username,
      role: decoded.role,
      displayName: decoded.displayName,
    };
  } catch (error) {
    // Ignore invalid tokens but remove any stale user information
    req.user = undefined;
  }
  next();
};

export const requireAuth = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  next();
};

const createRoleGuard = (allowedRoles, message = 'Forbidden') => (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
    res.status(403).json({ message });
    return;
  }

  next();
};

export const requireRole = (...allowedRoles) => createRoleGuard(allowedRoles);

export const requireAdmin = createRoleGuard(['admin'], 'Admin role required');

export const requireStaff = createRoleGuard(['staff'], 'Staff role required');
