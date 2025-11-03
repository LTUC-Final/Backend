const express = require("express");
const pg = require("pg");
require("dotenv").config();

const router = express.Router();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.get("/history/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query(
      `SELECT * FROM stripe_payments WHERE customer_id = $1 ORDER BY payment_date DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

module.exports = router;
