const express = require("express");
const router = express.Router();

const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const { hashPassword } = require("../_shared/password");

const allowedRoles = new Set(["customer", "provider"]);
const allowedEmailDomains = new Set([
  "gmail.com",
  "yahoo.com",
  "ymail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
]);

function squeezeSpaces(s) {
  return s.replace(/\s+/g, " ").trim();
}

function normalizeName(s) {
  return squeezeSpaces(s);
}

function isValidEnglishName(s) {
  if (typeof s !== "string") return false;
  const name = s.trim();
  if (name.length < 3 || name.length > 40) return false;
  if (!/^[A-Za-z][A-Za-z' -]*[A-Za-z]$/.test(name)) return false;
  if (/--|''|\s\s/.test(name)) return false;
  if (/[-']$|^[-']/.test(name)) return false;
  return true;
}

function isValidEmailSyntax(email) {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
}

function isAllowedEmailDomain(email) {
  const at = email.lastIndexOf("@");
  if (at === -1) return false;
  const domain = email.slice(at + 1).toLowerCase();
  return allowedEmailDomains.has(domain);
}

function normalizePhoneJordan(input) {
  if (typeof input !== "string") return null;
  let s = input.trim();
  s = s.replace(/\s+/g, "");
  s = s.replace(/^00/, "+");
  if (/^07\d{8}$/.test(s)) {
    s = "+962" + s.slice(1);
  } else if (/^9627\d{8}$/.test(s)) {
    s = "+" + s;
  }
  if (/^\+9627[7-9]\d{7}$/.test(s)) return s;
  return null;
}

function isValidPassword(pw) {
  if (typeof pw !== "string") return false;
  return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,64}$/.test(pw);
}

function isValidHttpUrl(u) {
  if (!u) return true;
  try {
    const url = new URL(u);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateRegisterPayload(body) {
  const errors = {};
  const raw = body || {};
  const firstname = normalizeName(String(raw.firstname || ""));
  const lastname = normalizeName(String(raw.lastname || ""));
  const email = String(raw.email || "").trim().toLowerCase();
  const password = String(raw.password || "");
  const role = String(raw.role || "");
  const phoneNormalized = normalizePhoneJordan(String(raw.phone ?? ""));
  const profile_image = raw.profile_image ? String(raw.profile_image) : null;

  if (!firstname || !isValidEnglishName(firstname)) {
    errors.firstname = "Only English letters (3–40), allow space/'/-.";
  }
  if (!lastname || !isValidEnglishName(lastname)) {
    errors.lastname = "Only English letters (3–40), allow space/'/-.";
  }
  if (!email || !isValidEmailSyntax(email) || !isAllowedEmailDomain(email)) {
    errors.email = "Email must be valid and from allowed providers (e.g., gmail.com).";
  }
  if (!password || !isValidPassword(password)) {
    errors.password = "Password must be 8–64, include letter, number, and symbol, no spaces.";
  }
  if (!allowedRoles.has(role)) {
    errors.role = "Role must be either 'customer' or 'provider'.";
  }
  if (!phoneNormalized) {
    errors.phone = "Phone must be a valid Jordanian mobile like +9627[7-9]XXXXXXX.";
  }
  if (!isValidHttpUrl(profile_image)) {
    errors.profile_image = "profile_image must be a valid http/https URL.";
  }

  const ok = Object.keys(errors).length === 0;
  return {
    ok,
    errors,
    normalized: {
      firstname,
      lastname,
      email,
      password,
      role,
      phone: phoneNormalized,
      profile_image,
    },
  };
}

router.post("/register", async (req, res) => {
  const v = validateRegisterPayload(req.body);
  if (!v.ok) {
    return res.status(400).json({ error: "Validation error", fields: v.errors });
  }

  const { firstname, lastname, email, password, role, phone, profile_image } = v.normalized;
  const client = await pool.connect();

  try {
    const dupEmail = await client.query(
      "SELECT 1 FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email]
    );
    if (dupEmail.rowCount > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const dupPhone = await client.query(
      "SELECT 1 FROM users WHERE phone = $1 LIMIT 1",
      [phone]
    );
    if (dupPhone.rowCount > 0) {
      return res.status(409).json({ error: "Phone already exists" });
    }

    await client.query("BEGIN");

    const password_hash = await hashPassword(password);
    const userRes = await client.query(
      `INSERT INTO users (firstname, lastname, email, password_hash, role, phone, profile_image)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING user_id, role`,
      [firstname, lastname, email, password_hash, role, phone, profile_image]
    );

    const user = userRes.rows[0];

    if (role === "provider") {
      await client.query(`INSERT INTO providers (user_id) VALUES ($1)`, [user.user_id]);
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: role === "provider"
        ? "Registered successfully as provider"
        : "Registered successfully as customer",
    });
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch {}
    if (error && error.code === "23505") {
      if (error.constraint === "users_email_lower_ux") {
        return res.status(409).json({ error: "Email already exists" });
      }
      if (error.constraint === "users_phone_ux") {
        return res.status(409).json({ error: "Phone already exists" });
      }
    }
    return res.status(500).json({ error: "Something went wrong while registering." });
  } finally {
    client.release();
  }
});

module.exports = router;
