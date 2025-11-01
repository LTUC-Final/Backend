const express = require("express");
const router = express.Router();

const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const jwt = require("jsonwebtoken");
const { comparePassword } = require("../_shared/password");

const allowedEmailDomains = new Set([
  "gmail.com",
  "yahoo.com",
  "ymail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
]);

function isValidEmailSyntax(email) {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
}
function isAllowedEmailDomain(email) {
  const at = email.lastIndexOf("@");
  if (at === -1) return false;
  const domain = email.slice(at + 1).toLowerCase();
  return allowedEmailDomains.has(domain);
}

router.post("/login", async (req, res) => {
  try {
    const body = req.body || {};
    const rawEmail = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");

    const fields = {};
    if (!rawEmail) fields.email = "Email is required.";
    if (!password) fields.password = "Password is required.";
    if (
      rawEmail &&
      (!isValidEmailSyntax(rawEmail) || !isAllowedEmailDomain(rawEmail))
    ) {
      fields.email = "Valid email required (Gmail/Yahoo/Outlook…).";
    }
    if (Object.keys(fields).length > 0) {
      return res.status(400).json({ error: "Validation error", fields });
    }

    const { rows } = await pool.query(
      `SELECT user_id, firstname, lastname, email, role, phone, profile_image, password_hash
       FROM users
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [rawEmail]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = rows[0];
    const ok = await comparePassword(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    let providerInfo = null;
    if (user.role === "provider") {
      const { rows: providerRows } = await pool.query(
        `SELECT *
         FROM providers
         WHERE user_id = $1`,
        [user.user_id]
      );
      if (providerRows.length > 0) providerInfo = providerRows[0];
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: 1000000 }
    );

    const safeUser = {
      user_id: user.user_id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profile_image: user.profile_image,
      provider: providerInfo,
    };

    return res.json({
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Something went wrong while logging in." });
  }
});

module.exports = router;
