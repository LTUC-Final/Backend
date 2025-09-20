// routes/payments/updatePaymentStatus.js
const express = require("express");
const pg = require("pg");
require("dotenv").config();

const router = express.Router();
router.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

router.put("/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status, updated_by } = req.body;

    const validStatus = ["pending", "unapproved", "ready_to_pay", "paid", "failed", "refunded"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: "Invalid payment status" });
    }

    // تحديث حالة الدفع
    const result = await pool.query(
      `UPDATE payments 
       SET status=$1, updated_by=$2, updated_at=NOW() 
       WHERE payment_id=$3 
       RETURNING *`,
      [status, updated_by, paymentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const payment = result.rows[0];

    // ✅ إذا الدفع ناجح → إنشاء Order وحذف الكارت
    if (status === "paid" && payment.cart_id) {
      const cartResult = await pool.query(
        `SELECT * FROM cart WHERE cart_id = $1`,
        [payment.cart_id]
      );

      if (cartResult.rows.length > 0) {
        const cart = cartResult.rows[0];

        // السعر النهائي موجود في cart.price أو حسابه إذا لم يكن موجود
        const finalPrice = cart.price ? parseFloat(cart.price) : 0;

        // إنشاء Order
        const orderResult = await pool.query(
          `INSERT INTO orders 
           (customer_id, provider_id, product_id, quantity, original_price, updated_price, details_order_user, response_from_provider, status) 
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending') RETURNING *`,
          [
            cart.customer_id,
            cart.provider_id,
            cart.product_id,
            cart.quantity,
            finalPrice,
            null, // updated_price سيضيفه المزود لاحقاً إذا كان هناك custom requirement
            cart.details_order_user,
            cart.provider_response || null,
          ]
        );

        // ربط الـ order بالـ payment
        await pool.query(
          `UPDATE payments SET order_id=$1 WHERE payment_id=$2`,
          [orderResult.rows[0].order_id, paymentId]
        );

        // حذف السلة بعد إنشاء الطلب
        await pool.query(`DELETE FROM cart WHERE cart_id=$1`, [payment.cart_id]);

        payment.order_id = orderResult.rows[0].order_id;
        payment.cart_id = null; // السلة تم حذفها
      }
    }

    res.json(payment);
  } catch (err) {
    console.error("Error updating payment status:", err);
    res.status(500).json({ error: "Server error while updating payment status" });
  }
});

module.exports = router;