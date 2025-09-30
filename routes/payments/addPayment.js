const express = require("express");
const pg = require("pg");
require("dotenv").config();

const router = express.Router();
router.use(express.json());

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// ✅ يدعم أكثر من cart_id
router.post("/", async (req, res) => {
  try {
    const { cart_ids, method, transaction_id } = req.body;
    console.log("📥 Incoming addPayment:", { cart_ids, method, transaction_id });

    if (!cart_ids || !Array.isArray(cart_ids) || cart_ids.length === 0) {
      return res.status(400).json({ error: "cart_ids array is required" });
    }

    const payments = [];

    for (const cart_id of cart_ids) {
      // تحقق من وجود دفع سابق لنفس الكارت
      const existingPayment = await pool.query(
        `SELECT * FROM payments WHERE cart_id = $1 AND status != 'refunded'`,
        [cart_id]
      );

      if (existingPayment.rows.length > 0) {
        console.warn("⚠️ Payment already exists for cart:", cart_id);
        payments.push(existingPayment.rows[0]);
        continue; // تخطى هذا الكارت
      }

      // جيب بيانات السلة
      const cartResult = await pool.query(
        `SELECT c.*, p.price AS product_price, u.user_id AS customer_id
         FROM cart c
         JOIN products p ON c.product_id = p.product_id
         JOIN users u ON c.customer_id = u.user_id
         WHERE c.cart_id = $1`,
        [cart_id]
      );

      if (cartResult.rows.length === 0) {
        console.error("❌ Cart not found:", cart_id);
        continue;
      }

      const cart = cartResult.rows[0];
      const quantity = cart.quantity || 1;
      const amount = parseFloat(cart.product_price) * quantity;

      // الحالة مباشرة → "paid"
      const status = "paid";

      const result = await pool.query(
        `INSERT INTO payments 
         (cart_id, customer_id, provider_id, amount, method, status, created_by, transaction_id) 
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [
          cart_id,
          cart.customer_id,
          cart.provider_id,
          amount,
          method,
          status,
          cart.customer_id,
          transaction_id || null,
        ]
      );

      console.log("✅ Payment inserted:", result.rows[0]);
      payments.push(result.rows[0]);

      // 🗑️ حذف الكارت من cart
      await pool.query(`DELETE FROM cart WHERE cart_id = $1`, [cart_id]);
      console.log("🗑️ Cart deleted:", cart_id);
    }

    res.status(201).json({
      message: "Payments created successfully",
      payments,
    });
  } catch (err) {
    console.error("❌ Error adding payments:", err);
    res.status(500).json({
      error: "Server error while adding payments",
      detail: err.message,
    });
  }
});

module.exports = router;
