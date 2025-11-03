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
    // console.log("user_id");
    // console.log(user_id);
    // console.log("user_id");

    const cartItems = await pool.query(
      `SELECT * FROM cart WHERE customer_id = $1 AND status_pay = 'Approve'`,
      [user_id]
    );

    if (cartItems.rows.length === 0) {
      return res.status(404).json({ message: "No approved cart items found" });
    }

    const ordersInserted = [];
    const check = await pool.query(
      "SELECT order_id, cart_id FROM orders ORDER BY order_id DESC LIMIT 1"
    );
    // console.log("CHECK FROM DB:", check.rows[0]);

    for (const item of cartItems.rows) {
      //     console.log("item.cart_id");
      //     console.log(item.cart_id);

      //     console.log("item.cart_id");
      const status = "pending";
      //     const cartIdNum = Number(item.cart_id);
      //     console.log(
      //       "Inserting order with cart_id:",
      //       item.cart_id,
      //       typeof item.cart_id
      //     );
      //     console.log(item);
      //     const order = await pool.query(
      //       `INSERT INTO orders
      //   (cart_id,customer_id, provider_id,details_order_user,  product_id, quantity, original_price, status )
      //  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      //  RETURNING *;`,
      //       [
      //         item.cart_id,
      //         item.customer_id,
      //         item.provider_id,

      //         item.custom_requirement,
      //         item.product_id,
      //         item.quantity,

      //         item.price ?? 0,
      //         status,
      //       ]
      //     );
      // console.log("INSERT VALUES:", {
      //   cart_id: item.cart_id,
      //   customer_id: item.customer_id,
      //   provider_id: item.provider_id,
      //   details_order_user: item.custom_requirement,
      //   product_id: item.product_id,
      //   quantity: item.quantity,
      //   original_price: item.price ?? 0,
      //   status,
      // });

      const order = await pool.query(
        `INSERT INTO orders
  (cart_id, customer_id, provider_id, details_order_user, product_id, quantity, original_price, status)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING *;`,
        [
          Number(item.cart_id),
          Number(item.customer_id),
          Number(item.provider_id),
          item.custom_requirement ?? null,
          Number(item.product_id),
          Number(item.quantity),
          parseFloat(item.price) || 0,
          status,
        ]
      );
      console.log("ORDER INSERTED:", order.rows[0]);

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

    res.json({ ordersCreated: ordersInserted, length: cartItems.rows.length });
  } catch (err) {
    console.error("Error in moveApprovedCartToOrders:", err.message);
    res
      .status(500)
      .json({ message: "Error moving approved cart items to orders" });
  }
});
module.exports = router;
