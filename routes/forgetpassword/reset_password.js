const express = require("express");
const router = express.Router();

const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const { hashPassword } = require("../_shared/password");


const normalizePhone = (p) => {
  if (!p) return null;
  const digits = String(p).replace(/\D/g, "");
  return digits.startsWith("0") ? "+" + digits.slice(1) : "+" + digits;
};

router.post("/forgetpassword/reset-password", async (req, res) => {
  const client = await pool.connect();
  try {
    const { reset_token, phone, new_password } = req.body || {};
    if (!reset_token || !phone || !new_password)
      return res.status(400).json({ error: "Validation error" });

    const phoneNorm = normalizePhone(phone);


    const { rows } = await client.query(
      `SELECT reset_id, used, expires_at
       FROM password_resets
       WHERE reset_token=$1 AND phone=$2
       ORDER BY created_at DESC
       LIMIT 1`,
      [reset_token, phoneNorm]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Token not found for this phone" });
    }

    const rec = rows[0];

 
    if (!rec.used) {
      return res.status(400).json({ error: "OTP not verified yet" });
    }


    if (new Date(rec.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: "OTP expired" });
    }

 
    const userRes = await client.query(
      "SELECT user_id FROM users WHERE phone=$1",
      [phoneNorm]
    );
    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

   
    const password_hash = await hashPassword(new_password);

    await client.query("BEGIN");
    await client.query("UPDATE users SET password_hash=$1 WHERE phone=$2", [
      password_hash,
      phoneNorm,
    ]);
    await client.query(
      "UPDATE password_resets SET reset_token=NULL WHERE reset_id=$1",
      [rec.reset_id]
    );
    await client.query("COMMIT");

    res.json({ message: "Password reset successfully" });
  } catch (e) {
    try { await client.query("ROLLBACK"); } catch {}
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
});

module.exports = router;
