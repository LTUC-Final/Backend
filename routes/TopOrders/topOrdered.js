const express = require("express");
const router = express.Router();
const pg = require("pg");

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.get("/topordered", async (req, res) => {
  try {
    const sql = `
      SELECT
        p.product_id,
        p.name,
        p.image AS image_url,
        p.price,
        COALESCE(p.timesordered, 0)::int AS timesordered
      FROM products p
      ORDER BY
        COALESCE(p.timesordered, 0) DESC,
        p.product_id ASC
      LIMIT 4;
    `;
    const { rows } = await pool.query(sql);
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to load top ordered items" });
  }
});

module.exports = router;
