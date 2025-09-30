// routes/payments/getPaymentsSummary.js
const express = require("express");
const pg = require("pg");
require("dotenv").config();

const router = express.Router();
router.use(express.json());

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

//  Get payments summary for a user (يشمل كل الحالات)
router.get("/summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS total_paid,
         COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) AS total_pending,
         COALESCE(SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END), 0) AS total_failed,
         COALESCE(SUM(CASE WHEN status = 'unapproved' THEN amount ELSE 0 END), 0) AS total_unapproved,
         COALESCE(SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END), 0) AS total_refunded,
         COALESCE(SUM(CASE WHEN status = 'ready_to_pay' THEN amount ELSE 0 END), 0) AS total_ready_to_pay,
         COUNT(*) AS total_payments
       FROM payments
       WHERE customer_id = $1`,
      [userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching payments summary:", err);
    res.status(500).json({ error: "Server error while fetching payments summary" });
  }
});

module.exports = router;
