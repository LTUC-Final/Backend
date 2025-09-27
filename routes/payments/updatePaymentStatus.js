// routes/payments/updatePaymentStatus.js
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

    console.log("📥 Update request:", { paymentId, status, updated_by });

    const validStatus = [
      "pending",
      "unapproved",
      "ready_to_pay",
      "paid",
      "failed",
      "refunded",
    ];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: "Invalid payment status" });
    }

    // تحديث حالة الدفع
    const result = await pool.query(
      `UPDATE payments 
       SET status=$1, updated_by=$2, updated_at=NOW() 
       WHERE payment_id=$3 
       RETURNING *`,
      [status, updated_by || null, paymentId]
    );

    if (result.rows.length === 0) {
      console.log("⚠️ Payment not found:", paymentId);
      return res.status(404).json({ error: "Payment not found" });
    }

    const payment = result.rows[0];
    console.log("✅ Payment updated:", payment);

    // ✅ إذا الدفع ناجح → أنشئ Orders لكل الكروت
    if (status === "paid") {
      let cartIds = [];

      // لو مخزن cart_ids (أكثر من كارت)
      if (payment.cart_ids) {
        try {
          cartIds = JSON.parse(payment.cart_ids);
        } catch (err) {
          console.error("❌ Error parsing cart_ids:", err);
        }
      }

      // fallback → إذا موجود cart_id واحد فقط
      if (payment.cart_id && cartIds.length === 0) {
        cartIds = [payment.cart_id];
      }

      console.log("🛒 Processing cartIds:", cartIds);

      for (const cartId of cartIds) {
        const cartResult = await pool.query(
          `SELECT * FROM cart WHERE cart_id = $1`,
          [cartId]
        );

        if (cartResult.rows.length > 0) {
          const cart = cartResult.rows[0];
          console.log("📦 Cart found for order creation:", cart);

          const finalPrice = cart.price ? parseFloat(cart.price) : 0;

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
              null,
              cart.details_order_user,
              cart.provider_response || null,
            ]
          );

          console.log("✅ Order created:", orderResult.rows[0]);

          // اربط الـ order بالدفع
          await pool.query(
            `UPDATE payments SET order_id=$1 WHERE payment_id=$2`,
            [orderResult.rows[0].order_id, paymentId]
          );

          // احذف الكارت بعد إنشاء الأوردر
          await pool.query(`DELETE FROM cart WHERE cart_id=$1`, [cartId]);
          console.log("🗑️ Cart deleted:", cartId);
        }
      }
    }

    res.json(payment);
  } catch (err) {
    console.error("❌ Error updating payment status:", err);
    res.status(500).json({
      error: "Server error while updating payment status",
      detail: err.message,
    });
  }
});

module.exports = router;
