// routes/payments/stripe.js
const Stripe = require("stripe");
require("dotenv").config();

// أنشئ instance من Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20", // حدد API version
});

module.exports = stripe;