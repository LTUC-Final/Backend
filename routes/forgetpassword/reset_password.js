const express = require("express");
const router = express.Router();
const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const { hashPassword } = require("../_shared/password");
const { parseToE164 } = require("../_shared/phone");

router.post("/forgetpassword/reset-password", async (req, res) => {
  const client = await pool.connect();
  try {
    const body = req.body || {};
    const reset_token = String(body.reset_token || "").trim();
    const new_password = String(body.new_password || "");
    const country = (body.country_code || "JO").toUpperCase();
    const phoneInput = body.phone || body.national_number || "";
    const phone = parseToE164(country, String(phoneInput));

    if (!reset_token || !phone || !new_password) {
      return res.status(400).json({ error: "Validation error" });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: "Password too weak" });
    }

    const pr = await client.query(
      `SELECT reset_id
       FROM password_resets
       WHERE phone=$1
         AND reset_token=$2
         AND used=true
         AND token_expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [phone, reset_token]
    );
    if (pr.rowCount === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const u = await client.query(
      `SELECT user_id FROM users WHERE phone=$1 LIMIT 1`,
      [phone]
    );
    if (u.rowCount === 0) return res.status(404).json({ error: "User not found" });

    const password_hash = await hashPassword(new_password);

    await client.query("BEGIN");
    await client.query(
      `UPDATE users
       SET password_hash=$1, password_changed_at=NOW()
       WHERE user_id=$2`,
      [password_hash, u.rows[0].user_id]
    );
    await client.query(
      `UPDATE password_resets
       SET reset_token=NULL, token_expires_at=NULL
       WHERE reset_id=$1`,
      [pr.rows[0].reset_id]
    );
    await client.query("COMMIT");

    return res.json({ message: "Password reset successfully" });
  } catch {
    try { await client.query("ROLLBACK"); } catch {}
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
});

module.exports = router;
