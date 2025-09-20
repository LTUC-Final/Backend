const { getToken, verifyToken } = require("../routes/_shared/jwt");

function routeGuard(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = routeGuard;

