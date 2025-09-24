// routes/payments/getStripeSession.js
const express = require("express");
const Stripe = require("stripe");
require("dotenv").config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.get("/session/:sessionId", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.json(session);
  } catch (err) {
    console.error("Error fetching Stripe session:", err.message);
    res.status(500).json({ error: "Error fetching Stripe session" });
  }
});

module.exports = router;