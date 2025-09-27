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
        COUNT(o.order_id)::int AS order_count
      FROM orders o
      JOIN products p ON p.product_id = o.product_id
      WHERE o.status = 'completed'
      GROUP BY p.product_id, p.name, p.image, p.price, p.timesordered
      ORDER BY
        order_count DESC,
        p.timesordered DESC NULLS LAST,
        p.product_id ASC
      LIMIT 4;
    `;
    const { rows } = await pool.query(sql);
    res.json({ items: rows });
  } catch {
    res.status(500).json({ error: "Failed to load top ordered items" });
  }
});

module.exports = router;
