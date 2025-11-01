const express = require("express");
const Stripe = require("stripe");
const pg = require("pg");
require("dotenv").config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Stripe requires the raw body for webhook signature verification
router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ Listen for checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const paymentIntentId = session.payment_intent;
      const metadata = session.metadata;

      try {
        // Retrieve PaymentIntent with expanded data
        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId,
          {
            expand: ["charges.data.payment_method_details"],
          }
        );

        const charge = paymentIntent.charges.data[0];
        const card = charge.payment_method_details.card;

        const card_brand = card.brand;
        const card_last4 = card.last4;
        const card_exp_month = card.exp_month;
        const card_exp_year = card.exp_year;

        const amount = session.amount_total / 100;
        const currency = session.currency;
        const email = session.customer_email;
        const status = session.payment_status || "paid";

        const cart_ids = metadata.cart_ids.split(",");
        const customer_id = metadata.customer_id;

        const providerRes = await pool.query(
          `SELECT provider_id FROM cart WHERE cart_id = $1 LIMIT 1`,
          [cart_ids[0]]
        );
        const provider_id = providerRes.rows[0]?.provider_id || null;

        await pool.query(
          `INSERT INTO stripe_payments 
         (stripe_payment_id, customer_id, provider_id, amount, currency, status, cart_ids, email, card_brand, card_last4, card_exp_month, card_exp_year, payment_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())`,
          [
            session.id,
            customer_id,
            provider_id,
            amount,
            currency,
            status,
            cart_ids,
            email,
            card_brand,
            card_last4,
            card_exp_month,
            card_exp_year,
          ]
        );

        await pool.query(
          `INSERT INTO provider_balance (provider_id, total_balance)
         VALUES ($1, $2)
         ON CONFLICT (provider_id)
         DO UPDATE SET total_balance = provider_balance.total_balance + EXCLUDED.total_balance;`,
          [provider_id, amount]
        );

        console.log("✅ Payment stored successfully from Webhook:", session.id);
        res.status(200).send("success");
      } catch (error) {
        console.error("❌ Error handling checkout.session.completed:", error);
        res.status(500).send("Error processing payment");
      }
    } else {
      res.status(200).send("Unhandled event type");
    }
  }
);

module.exports = router;
