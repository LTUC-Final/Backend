//routes/cart/changeStatusPayOfProdactAfterApprove
// routes/cart/changeStatusPayOfProdactAfterApprove.js
const express = require("express");
const pg = require("pg");
require("dotenv").config();

const router = express.Router();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.put("/changeStatusPayOfProdactAfterApprove", async (req, res) => {
  try {
    const { cart_id, user_id } = req.body;

    // نجيب السعر الجديد اللي حطه البروفايدر
    const orderRes = await pool.query(
      `SELECT updated_price FROM orders WHERE cart_id = $1`,
      [cart_id]
    );

    if (orderRes.rows.length === 0 || !orderRes.rows[0].updated_price) {
      return res.status(400).json({ message: "لا يوجد سعر جديد من المزود" });
    }

    const newPrice = orderRes.rows[0].updated_price;

    // تحديث الكارت
    const result = await pool.query(
      `UPDATE cart 
       SET status_pay = 'Approve', price = $3
       WHERE cart_id = $1 AND customer_id = $2
       RETURNING *`,
      [cart_id, user_id, newPrice]
    );

    // تحديث الطلب
    const orderUpdate = await pool.query(
      `UPDATE orders
       SET status = 'approved'
       WHERE cart_id = $1
       RETURNING *`,
      [cart_id]
    );

    res.json({
      message: " تم قبول الطلب وتحديث السعر",
      cart: result.rows[0],
      order: orderUpdate.rows[0],
    });
  } catch (err) {
    console.error("Error in changeStatusPayOfProdactAfterApprove:", err.message);
    res.status(500).json({ message: "Error approving order" });
  }
});
module.exports = router;
