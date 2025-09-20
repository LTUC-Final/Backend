const express = require("express");
const router = express.Router();

const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const jwt = require("jsonwebtoken");

function getToken(req) {
  if (req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];
  }
  if (req.query && req.query.token) return req.query.token;
  return null;
}

router.get("/wishlist", async (req, res) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: "Missing token" });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const userId = payload.user_id;

    const { rows } = await pool.query(
      `SELECT wishlist_id, customer_id, product_id, created_at
       FROM wishlist
       WHERE customer_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ items: rows });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/wishlist/:userId", async (req, res) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: "Missing token" });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    if (String(payload.user_id) !== String(userId)) return res.status(403).json({ error: "Forbidden" });

    const { rows } = await pool.query(
      `SELECT wishlist_id, customer_id, product_id, created_at
       FROM wishlist
       WHERE customer_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ items: rows });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
