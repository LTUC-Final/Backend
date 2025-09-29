const express = require("express");
const pg = require("pg");
const cors = require("cors");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.post("/moveApprovedCartToOrders/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const cartItems = await pool.query(
      `SELECT * FROM cart WHERE customer_id = $1 AND status_pay = 'Approve'`,
      [user_id]
    );

    if (cartItems.rows.length === 0) {
      return res.status(404).json({ message: "No approved cart items found" });
    }

    const ordersInserted = [];

    for (const item of cartItems.rows) {
      const status = "pending";
      const order = await pool.query(
        `INSERT INTO orders
          (details_order_user, original_price, provider_id, product_id, quantity, customer_id, status, cart_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *;`,
        [
          item.custom_requirement,
          item.price,
          item.provider_id,
          item.product_id,
          item.quantity,
          item.customer_id,
          status,
          item.cart_id,
        ]
      );
      ordersInserted.push(order.rows[0]);
      await pool.query(
        `UPDATE products
         SET timesordered = COALESCE(timesordered, 0) + 1
         WHERE product_id = $1`,
        [item.product_id]
      );
    }

    const deleteAllCart = await pool.query(
      `DELETE FROM cart WHERE customer_id = $1 AND status_pay = 'Approve'`,
      [user_id]
    );

    res.json({ ordersCreated: ordersInserted });
  } catch (err) {
    console.error("Error in moveApprovedCartToOrders:", err.message);
    res
      .status(500)
      .json({ message: "Error moving approved cart items to orders" });
  }
});
module.exports = router;
