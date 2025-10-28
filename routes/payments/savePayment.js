const express = require("express");
const Stripe = require("stripe");
const pg = require("pg");
require("dotenv").config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.post("/save-payment", async (req, res) => {
  try {
    const { session_id } = req.body;
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items"],
    });
const paymentIntent = await stripe.paymentIntents.retrieve(
  session.payment_intent,
  {
    expand: ["charges.data.payment_method_details"],
  }
);


    
let card_brand = null;
let card_last4 = null;
let card_exp_month = null;
let card_exp_year = null;

if (
  paymentIntent.charges &&
  paymentIntent.charges.data &&
  paymentIntent.charges.data.length > 0
) {
  const charge = paymentIntent.charges.data[0];
  const cardInfo = charge.payment_method_details?.card;

  if (cardInfo) {
    card_brand = cardInfo.brand;
    card_last4 = cardInfo.last4;
    card_exp_month = cardInfo.exp_month;
    card_exp_year = cardInfo.exp_year;
  }
} else {
  console.warn("⚠️ No charge data found for this PaymentIntent:", session.id);
}

    console.log(
      "💳 Card info:",
      card_brand,
      card_last4,
      card_exp_month,
      card_exp_year
    );
    const amount = session.amount_total / 100;
    const currency = session.currency;
    const email = session.customer_email;
    const status = session.payment_status;
    // const cart_ids = session.metadata.cart_ids;
    // const customer_id = session.metadata.customer_id;

    const cart_ids = session.metadata.cart_ids.split(",");
    const customer_id = session.metadata.customer_id;
    const providerResult = await pool.query(
      `SELECT provider_id FROM cart WHERE cart_id = $1 LIMIT 1`,
      [cart_ids[0]]
    );
    const provider_id = providerResult.rows[0]?.provider_id || null;
    console.log("provider_id");
    console.log(provider_id);
    console.log("provider_id");

    // await pool.query(
    //   `INSERT INTO stripe_payments
    //    (stripe_payment_id, customer_id, amount, currency, status, cart_ids, email )
    //    VALUES ($1,$2,$3,$4,$5,$6,$7);`,
    //   [session.id, customer_id, amount, currency, status, cart_ids, email]
    // );

    await pool.query(
      `INSERT INTO stripe_payments 
  (stripe_payment_id, customer_id, provider_id, amount, currency, status, cart_ids, email, card_brand, card_last4, card_exp_month, card_exp_year)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
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

    res.json({ message: "Payment saved successfully", session });
  } catch (err) {
    console.error(" Error saving payment:", err);
    res
      .status(500)
      .json({ error: "Failed to save payment", details: err.message });
  }
});

module.exports = router;
