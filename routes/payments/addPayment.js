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
    const { cart_id, method } = req.body;

    if (!cart_id || !method) {
      return res.status(400).json({ error: "cart_id and method are required" });
    }

    // تحقق من وجود أي دفع للسلة، أي status
    const existingPayment = await pool.query(
      `SELECT * FROM payments WHERE cart_id = $1 AND status != 'refunded'`,
      [cart_id]
    );
    if (existingPayment.rows.length > 0) {
      return res.status(400).json({
        error: "A payment for this cart already exists",
        payment: existingPayment.rows[0],
      });
    }

    // جلب السلة مع سعر المنتج
    const cartResult = await pool.query(
      `SELECT c.*, p.price AS product_price
       FROM cart c
       JOIN products p ON c.product_id = p.product_id
       WHERE c.cart_id = $1`,
      [cart_id]
    );

    if (cartResult.rows.length === 0) {
      return res.status(404).json({ error: "Cart not found or product missing" });
    }

    const cart = cartResult.rows[0];

    // فحص القيم الأساسية
    if (!cart.customer_id) return res.status(400).json({ error: "Customer ID missing in cart" });
    if (!cart.provider_id) return res.status(400).json({ error: "Provider ID missing in cart" });
    if (!cart.product_price) return res.status(400).json({ error: "Product price missing" });
    if (!cart.quantity) cart.quantity = 1;

    // حساب المبلغ النهائي
    const amount = parseFloat(cart.product_price) * cart.quantity;

    // ضبط created_by تلقائيًا
    const created_by = cart.customer_id;

    // ضبط status حسب وجود custom_requirement
    const status = cart.custom_requirement ? "unapproved" : "ready_to_pay";

    console.log("Creating payment:", { cart_id, amount, method, status, created_by });

    // إدخال الدفع
    const result = await pool.query(
      `INSERT INTO payments 
       (cart_id, customer_id, amount, method, status, provider_id, created_by) 
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [cart_id, cart.customer_id, amount, method, status, cart.provider_id, created_by]
    );

    res.status(201).json({
      message: `Payment created successfully (${status})`,
      payment: result.rows[0],
    });

  } catch (err) {
    console.error("Error adding payment:", err);
    res.status(500).json({ error: "Server error while adding payment", detail: err.message });
  }
});

module.exports = router;
