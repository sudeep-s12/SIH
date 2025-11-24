import { getSession } from 'next-auth/react';

export function withRole(handler, allowedRoles = []) {
  return async (req, res) => {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized: No session' });
    }
    const userRole = session.user.role || 'viewer'; // Assume 'viewer' if unspecified

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }
    // Attach user data to request if needed
    req.user = session.user;
    return handler(req, res);
  };
}
