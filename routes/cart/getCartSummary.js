//routes/getCartSummary.js
const express = require("express");
const pg = require("pg");
const cors = require("cors");
 
require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });


router.get("/", async (req, res) => {
     try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ message: "user_id required" });

    const result = await pool.query(
      `SELECT SUM(c.quantity * p.price) AS total_price,
              COUNT(*) AS total_items
       FROM cart c
       JOIN products p ON c.product_id = p.product_id
       WHERE c.customer_id=$1`,
      [user_id]
    );

    res.json(result.rows[0] || { total_price: 0, total_items: 0 });
  } catch (err) {
    console.error(" Error in getCartSummary:", err.message);
    res.status(500).json({ message: "Error fetching cart summary" });
  }
});

module.exports = router;