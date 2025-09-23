// routes/payments/stripeCheckout.js
const express = require("express");
const Stripe = require("stripe");
const pg = require("pg");
require("dotenv").config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { cart_id } = req.body;

    if (!cart_id) {
      return res.status(400).json({ error: "cart_id is required" });
    }

    // جلب بيانات الكارت
    const cartResult = await pool.query(
      `SELECT c.*, p.name, p.price, u.email 
       FROM cart c
       JOIN products p ON c.product_id = p.product_id
       JOIN users u ON c.customer_id = u.user_id
       WHERE c.cart_id = $1`,
      [cart_id]
    );

    if (cartResult.rows.length === 0) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const cart = cartResult.rows[0];

    // إنشاء session
 const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  mode: "payment",
  line_items: [
    {
      price_data: {
        currency: "usd",
        product_data: { name: cart.name },
        unit_amount: Math.round(parseFloat(cart.price) * 100),
      },
      quantity: cart.quantity,
    },
  ],
  customer_email: cart.email,
  metadata: { cart_id: cart.cart_id.toString() }, // 👈 احتفظ بالـ cart_id
  success_url: "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}", // 👈 مهم
  cancel_url: "http://localhost:5173/cancel",
});

    // 🔹 رجّع الـ session.id بدل url
    res.json({ id: session.id });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    res.status(500).json({ error: "Stripe error", detail: err.message });
  }
});

module.exports = router;