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

    // 2. نقل كل عنصر إلى orders
    for (const item of cartItems.rows) {
      const status = "pending"; // يمكن تغيير الحالة حسب المنطق
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
    }

    res.json({ ordersCreated: ordersInserted });
  } catch (err) {
    console.error("Error in moveApprovedCartToOrders:", err.message);
    res
      .status(500)
      .json({ message: "Error moving approved cart items to orders" });
  }
});
module.exports = router;
