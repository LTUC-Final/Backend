const express = require("express");
const router = express.Router();
const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const twilio = require("twilio");
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const { v4: uuidv4 } = require("uuid");
const { parseToE164 } = require("../_shared/phone");

router.post("/forgetpassword/verify-otp", async (req, res) => {
  try {
    const body = req.body || {};
    const code = String(body.otp || body.code || "").trim();
    const country = (body.country_code || "JO").toUpperCase();
    const phoneInput = body.phone || body.national_number || "";
    const phone = parseToE164(country, String(phoneInput));
    if (!phone || !code) return res.status(400).json({ error: "Validation error" });

    const pending = await pool.query(
      `SELECT reset_id, attempts, locked_until
       FROM password_resets
       WHERE phone=$1 AND used=false AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [phone]
    );
    if (pending.rowCount === 0) return res.status(400).json({ error: "No valid pending OTP" });

    const { reset_id, attempts: currentAttempts, locked_until } = pending.rows[0];
    if (locked_until && new Date(locked_until) > new Date()) {
      return res.status(429).json({ error: "Too many attempts. Try later." });
    }

    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID || "";
    if (!serviceSid) return res.status(500).json({ error: "Verify service not configured" });

    const check = await client.verify.v2.services(serviceSid).verificationChecks.create({ to: phone, code });
    if (!check || check.status !== "approved") {
      const attempts = currentAttempts + 1;
      let lockUntil = null;
      const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS || "5", 10);
      const lockMinutes = parseInt(process.env.OTP_LOCK_MINUTES || "15", 10);
      if (attempts >= maxAttempts) lockUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
      await pool.query(
        `UPDATE password_resets SET attempts=$1, locked_until=$2 WHERE reset_id=$3`,
        [attempts, lockUntil, reset_id]
      );
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const reset_token = uuidv4();
    const tokenMinutes = parseInt(process.env.RESET_TOKEN_EXPIRY_MINUTES || "10", 10);
    const tokenExpiresAt = new Date(Date.now() + tokenMinutes * 60 * 1000);

    await pool.query(
      `UPDATE password_resets
       SET used=true, reset_token=$1, token_expires_at=$2
       WHERE reset_id=$3`,
      [reset_token, tokenExpiresAt, reset_id]
    );

    return res.json({ message: "OTP verified", reset_token, expires_in_minutes: tokenMinutes });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
