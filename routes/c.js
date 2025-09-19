//routes/carts/providerRespond.js
const express = require("express");
const pg = require("pg");
const cors = require("cors");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Provider responds with updated price
router.put("/", async (req, res) => {
  try {
    const { order_id, cart_id, updated_price, response_from_provider } = req.body;

    // Update order with provider response
    await pool.query(
      `UPDATE orders 
       SET updated_price = $1, response_from_provider = $2
       WHERE order_id = $3`,
      [updated_price, response_from_provider, order_id]
    );

    // Update cart with final price (original_price + updated_price)
    const updatedCart = await pool.query(
      `UPDATE cart 
       SET price = price + $1
       WHERE cart_id = $2
       RETURNING *`,
      [updated_price, cart_id]
    );

    res.json(updatedCart.rows[0]);
  } catch (err) {
    console.error("Error in providerRespond:", err.message);
    res.status(500).json({ message: "Error responding to custom requirement" });
  }
});

module.exports = router;