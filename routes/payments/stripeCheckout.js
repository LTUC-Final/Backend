// routes/payments/stripeCheckout.js
const express = require("express");
const Stripe = require("stripe");
const pg = require("pg");
require("dotenv").config();
const path = require("path");
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const portFront = process.env.PORT_FRONT;
const port = process.env.PORT;
router.use("/uploads", express.static("uploads"));

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { customer_id, email, products } = req.body;

    const cartResult = await pool.query(
      `SELECT c.*, p.name AS product_name, p.image AS product_image
FROM cart c
INNER JOIN products p ON p.product_id = c.product_id
WHERE c.customer_id = $1 AND c.status_pay = 'Approve';
`,
      [customer_id]
    );
    console.log(cartResult.rows);
    const cartItems = cartResult.rows;

    if (!cartItems.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }
    const lineItems = cartItems.map((item) => {
      const productFromFront = products.find((p) => p.cart_id === item.cart_id);
      const imagePath = item.product_image
        ? path.join(__dirname, "../../uploads", item.product_image)
        : null;
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product_name || `Product ${item.product_id}`,
            images: item.product_image
              ? [`http://localhost:${port}/uploads/${item.product_image}`]
              : [],
          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: productFromFront ? parseInt(productFromFront.quantity) : 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      customer_email: email || null,
      metadata: {
        cart_ids: products.map((p) => p.cart_id).join(","),
        customer_id: customer_id,
      },
      success_url: `http://localhost:${portFront}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:${portFront}/cancel`,
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    res.status(500).json({ error: "Stripe error", detail: err.message });
  }
});

module.exports = router;
