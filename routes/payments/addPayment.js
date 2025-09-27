// routes/payments/addPayment.js
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

router.post("/", async (req, res) => {
  try {
    const { cart_id, method, transaction_id } = req.body;
    console.log("📥 Incoming addPayment:", { cart_id, method, transaction_id });

    if (!cart_id || !method) {
      return res.status(400).json({ error: "cart_id and method are required" });
    }

    //  تأكد إنو في دفع مسبق
    const existingPayment = await pool.query(
      `SELECT * FROM payments WHERE cart_id = $1 AND status != 'refunded'`,
      [cart_id]
    );
    console.log("🔍 Existing payment check:", existingPayment.rows);

    if (existingPayment.rows.length > 0) {
      return res.status(400).json({
        error: "A payment for this cart already exists",
        payment: existingPayment.rows[0],
      });
    }

    // جيب بيانات السلة مع المنتج والمستخدم
    const cartResult = await pool.query(
      `SELECT c.*, p.price AS product_price, u.user_id AS customer_id
       FROM cart c
       JOIN products p ON c.product_id = p.product_id
       JOIN users u ON c.customer_id = u.user_id
       WHERE c.cart_id = $1`,
      [cart_id]
    );
    console.log("🛒 Cart lookup:", cartResult.rows);

    if (cartResult.rows.length === 0) {
      return res.status(404).json({ error: "Cart not found or product missing" });
    }

    const cart = cartResult.rows[0];

    //  تحقق من البيانات المهمة
    if (!cart.customer_id) return res.status(400).json({ error: "Customer ID missing in cart" });
    if (!cart.provider_id) return res.status(400).json({ error: "Provider ID missing in cart" });
    if (!cart.product_price) return res.status(400).json({ error: "Product price missing" });

    const quantity = cart.quantity || 1;
    const amount = parseFloat(cart.product_price) * quantity;

    const created_by = cart.customer_id;
    const status = cart.custom_requirement ? "unapproved" : "ready_to_pay";

    console.log("🟢 Creating payment with:", {
      cart_id,
      customer_id: cart.customer_id,
      provider_id: cart.provider_id,
      amount,
      method,
      status,
      transaction_id,
    });

    const result = await pool.query(
      `INSERT INTO payments 
       (cart_id, customer_id, amount, method, status, provider_id, created_by, transaction_id) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        cart_id,
        cart.customer_id,
        amount,
        method,
        status,
        cart.provider_id,
        created_by,
        transaction_id || null,
      ]
    );

    console.log("✅ Payment inserted:", result.rows[0]);

    res.status(201).json({
      message: `Payment created successfully (${status})`,
      payment: result.rows[0],
    });

  } catch (err) {
    console.error("❌ Error adding payment:", err);
    res.status(500).json({ error: "Server error while adding payment", detail: err.message });
  }
});

module.exports = router;
