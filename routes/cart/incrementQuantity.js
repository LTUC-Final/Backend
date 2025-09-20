//reoutes/incrementQuantity.js
const express = require("express");
const pg = require("pg");
const cors = require("cors");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Increment quantity and update price based on unit price
router.put("/", async (req, res) => {
  try {
    const { cart_id, user_id } = req.body;

    // Get current quantity and price
    const cartResult = await pool.query(
      "SELECT quantity, price FROM cart WHERE cart_id=$1 AND customer_id=$2",
      [cart_id, user_id]
    );

    if (cartResult.rows.length === 0) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const { quantity, price } = cartResult.rows[0];
    const unitPrice = price / quantity; // سعر الوحدة = سعر الكلية / الكمية
    const newQuantity = quantity + 1;
    const newPrice = unitPrice * newQuantity;

    // Update cart
    const result = await pool.query(
      `UPDATE cart 
       SET quantity=$1, price=$2
       WHERE cart_id=$3 AND customer_id=$4
       RETURNING *`,
      [newQuantity, newPrice, cart_id, user_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error in incrementQuantity:", err.message);
    res.status(500).json({ message: "Error incrementing quantity" });
  }
});

module.exports = router;