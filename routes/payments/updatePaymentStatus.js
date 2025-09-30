const express = require("express");
const pg = require("pg");
require("dotenv").config();

const router = express.Router();
router.use(express.json());

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.put("/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status, updated_by } = req.body;

    console.log(" Update request:", { paymentId, status, updated_by });

    const validStatus = [
      "pending",
      "unapproved",
      "ready_to_pay",
      "paid",
      "failed",
      "refunded",
    ];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: "Invalid payment status" });
    }

    const result = await pool.query(
      `UPDATE payments 
       SET status=$1, updated_by=$2, updated_at=NOW() 
       WHERE payment_id=$3 
       RETURNING *`,
      [status, updated_by || null, paymentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const payment = result.rows[0];

    console.log("✅ Payment updated:", payment);
    res.json(payment);
  } catch (err) {
    console.error("❌ Error updating payment status:", err);
    res.status(500).json({
      error: "Server error while updating payment status",
      detail: err.message,
    });
  }
});

module.exports = router;
