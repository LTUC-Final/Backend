
//routes/addToOrder.js
const express = require("express");
const pg = require("pg");
const cors = require("cors");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

//  POST /api/orders - add new order from cart
router.post("/", async (req, res) => {
  try {
    const { customer_id, product_id, quantity, details_order_user } = req.body;

    if (!customer_id || !product_id) {
      return res.status(400).json({ error: "customer_id and product_id are required" });
    }

    const qty = quantity || 1; // الافتراضي 1

    // نجيب معلومات المنتج (price + provider_id)
    const productResult = await pool.query(
      `SELECT provider_id, price 
       FROM products 
       WHERE product_id = $1`,
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { provider_id, price } = productResult.rows[0];

    //  نحسب original_price = price * quantity
    const original_price = parseFloat(price) * qty;

    //  نضيف order جديد
    const orderResult = await pool.query(
      `INSERT INTO orders 
      (customer_id, provider_id, product_id, quantity, original_price, updated_price, details_order_user) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [
        customer_id,
        provider_id,
        product_id,
        qty,
        original_price,
        null, // updated_price مبدئياً فاضي
        details_order_user || null,
      ]
    );

    res.status(201).json({
      message: "Order created successfully",
      order: orderResult.rows[0],
    });
  } catch (error) {
    console.error("Error adding order:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
