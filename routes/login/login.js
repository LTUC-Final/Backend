const express = require("express");
const router = express.Router();
//Login page
const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const jwt = require("jsonwebtoken");
const { comparePassword } = require("../_shared/password");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "Validation error" });

    const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid email or password" });

    const user = rows[0];
    const ok = await comparePassword(password, user.password_hash);
    if (!ok)
      return res.status(401).json({ error: "Invalid email or password" });

    let providerInfo = null;
    if (user.role === "provider") {
      const { rows: providerRows } = await pool.query(
        `SELECT provider_id, user_id, bio, skills, created_at
           FROM providers
          WHERE user_id = $1`,
        [user.user_id]
      );
      if (providerRows.length > 0) {
        providerInfo = providerRows[0];
      }
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        ...user,
        provider: providerInfo,
      },
    });
  } catch (error) {
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
