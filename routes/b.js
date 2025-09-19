//routes/carts/customerDecision.js

const express = require("express");
const pg = require("pg");
const cors = require("cors");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Customer approves or rejects
router.put("/approve", async (req, res) => {
  try {
    const { cart_id, user_id } = req.body;

    const result = await pool.query(
      `UPDATE cart 
       SET status_pay = 'Approve'
       WHERE cart_id = $1 AND customer_id = $2
       RETURNING *`,
      [cart_id, user_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error in customer approve:", err.message);
    res.status(500).json({ message: "Error approving custom requirement" });
  }
});

router.delete("/reject/:cart_id/:user_id", async (req, res) => {
  try {
    const { cart_id, user_id } = req.params;

    await pool.query(
      `DELETE FROM cart 
       WHERE cart_id = $1`,
      [cart_id, user_id]
    );

    res.json({ message: "Cart item rejected and removed" });
  } catch (err) {
    console.error("Error in customer reject:", err.message);
    res.status(500).json({ message: "Error rejecting custom requirement" });
  }
});

module.exports = router;