// routes/payments/getPaymentsSummary.js
const express = require("express");
const pg = require("pg");
require("dotenv").config();

const router = express.Router();
router.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

//  Get payments summary for a user
router.get("/:userId/summary", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT 
         SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END) AS total_paid,
         SUM(CASE WHEN p.status = 'pending' THEN p.amount ELSE 0 END) AS total_pending,
         SUM(CASE WHEN p.status = 'failed' THEN p.amount ELSE 0 END) AS total_failed,
         COUNT(*) AS total_payments
       FROM payments p
       LEFT JOIN cart c ON p.cart_id = c.cart_id
       LEFT JOIN orders o ON p.order_id = o.order_id
       WHERE (c.customer_id = $1 OR o.customer_id = $1)`,
      [userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching payments summary:", err);
    res.status(500).json({ error: "Server error while fetching payments summary" });
  }
});

module.exports = router;
