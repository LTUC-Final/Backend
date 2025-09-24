const express = require("express");
const router = express.Router();

const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const { comparePassword } = require("../_shared/password");
const { v4: uuidv4 } = require("uuid");

router.post("/forgetpassword/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body || {};
    if (!phone || !otp) return res.status(400).json({ error: "Validation error" });

    const { rows } = await pool.query(
      `SELECT reset_id, otp_hash, expires_at, used
       FROM password_resets
       WHERE phone=$1
       ORDER BY created_at DESC
       LIMIT 1`,
      [phone]
    );

    if (rows.length === 0) return res.status(404).json({ error: "No pending OTP" });

    const rec = rows[0];
    if (rec.used) return res.status(400).json({ error: "OTP already used" });
    if (new Date(rec.expires_at).getTime() < Date.now())
      return res.status(400).json({ error: "OTP expired" });

    const ok = await comparePassword(otp, rec.otp_hash);
    if (!ok) return res.status(400).json({ error: "Invalid OTP" });

    const reset_token = uuidv4();

    await pool.query(
      `UPDATE password_resets
       SET used=true, reset_token=$1
       WHERE reset_id=$2`,
      [reset_token, rec.reset_id]
    );

    res.json({ message: "OTP verified", reset_token });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
