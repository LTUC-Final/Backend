const express = require("express");
const router = express.Router();

const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const { parseToE164 } = require("../_shared/phone");
const { generateOTP } = require("../_shared/otp");
const { hashPassword } = require("../_shared/password");
const { sendSMS } = require("../_shared/sms");

router.post("/forgetpassword/forgot", async (req, res) => {
  try {
    const { country_code, national_number } = req.body || {};
    if (!country_code || !national_number)
      return res.status(400).json({ error: "Validation error" });

    const phone = parseToE164(country_code, national_number);
    if (!phone) return res.status(400).json({ error: "Invalid phone number" });

    const otp = generateOTP(6);
    const otp_hash = await hashPassword(otp);
    const expiryMin = parseInt(process.env.OTP_EXPIRY_MINUTES || "5", 10);
    const expires_at = new Date(Date.now() + expiryMin * 60 * 1000);

    await pool.query(
      `INSERT INTO password_resets (phone, otp_hash, expires_at, used)
       VALUES ($1,$2,$3,false)`,
      [phone, otp_hash, expires_at]
    );

    if (process.env.NODE_ENV !== "production") {
      console.log("[DEV OTP]", phone, otp);
    }

  
    try { await sendSMS(phone, `Your OTP is ${otp}. It expires in ${expiryMin} minutes.`); }
    catch (_) { /* ignore in dev */ }

    res.json({ message: "OTP sent" });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
