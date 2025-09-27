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
    const { cart_ids } = req.body;

    if (!cart_ids || cart_ids.length === 0) {
      return res.status(400).json({ error: "cart_ids are required" });
    }

    // جلب بيانات كل الكروت
    const cartResult = await pool.query(
      `SELECT c.*, p.name, p.price, u.email 
       FROM cart c
       JOIN products p ON c.product_id = p.product_id
       JOIN users u ON c.customer_id = u.user_id
       WHERE c.cart_id = ANY($1::int[])`,
      [cart_ids]
    );

    if (cartResult.rows.length === 0) {
      return res.status(404).json({ error: "No carts found" });
    }

    const carts = cartResult.rows;

    // line_items لكل المنتجات
    const line_items = carts.map((cart) => ({
      price_data: {
        currency: "usd",
        product_data: { name: cart.name },
        unit_amount: Math.round(parseFloat(cart.price) * 100),
      },
      quantity: cart.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      customer_email: carts[0].email, // أول إيميل من العميل
      metadata: { cart_ids: JSON.stringify(cart_ids) }, // نخزن الكروت
      success_url: "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/cancel",
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    res.status(500).json({ error: "Stripe error", detail: err.message });
  }
});

module.exports = router;