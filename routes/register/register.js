const express = require("express");
const router = express.Router();

const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const { hashPassword } = require("../_shared/password");

const allowedRoles = new Set(["customer", "provider"]);

router.post("/register", async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      role,
      phone = null,
      profile_image = null
    } = req.body || {};

if (!firstname || !lastname || !email || !password || !role)
      return res.status(400).json({ error: "Validation error" });

    if (!allowedRoles.has(role))
      return res.status(400).json({ error: "Role must be either 'customer' or 'provider'" });

    const exists = await pool.query("SELECT 1 FROM users WHERE email=$1", [email]);
    if (exists.rowCount > 0) return res.status(409).json({ error: "Email already exists" });

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

    res.status(201).json({
      message: role === "provider"
        ? "Registered successfully as provider"
        : "Registered successfully as customer"
    });
  }  catch (error) {
    console.error("Error fetching  quiry :", error.message);
    let obj = {
      error: "somthing habpend  ",
    };
    res.status(500).json({
      error: "Something went wrong while fetching a quiry.",
    });
  }
});

module.exports = router;
