
//routes/getAllCarts.js
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
    const result = await pool.query(
      `SELECT c.cart_id, c.customer_id, u.firstname, u.lastname, u.email,
              c.product_id, p.name as product_name, c.quantity, c.details_order_user,
              c.created_at
       FROM cart c
       JOIN users u ON c.customer_id = u.user_id
       JOIN products p ON c.product_id = p.product_id
       ORDER BY c.created_at DESC`
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching all carts:", error);
    res.status(500).json({ message: "Error fetching all carts" });
  }
}
);

module.exports = router;
