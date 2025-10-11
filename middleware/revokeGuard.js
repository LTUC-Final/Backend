const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function revokeGuard(req, res, next) {
  try {
    if (!req.user || !req.user.user_id || typeof req.user.iat !== "number") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { rows } = await pool.query(
      "SELECT password_changed_at FROM users WHERE user_id = $1",
      [req.user.user_id]
    );
    if (!rows.length) return res.status(401).json({ error: "Unauthorized" });

    const changedAt = rows[0].password_changed_at;
    if (changedAt && req.user.iat * 1000 < new Date(changedAt).getTime()) {
      return res.status(401).json({ error: "Token revoked due to password change" });
    }

    next();
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = revokeGuard;
