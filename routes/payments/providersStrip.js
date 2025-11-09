const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const pg = require("pg");
require("dotenv").config();
const portFront = process.env.PORT_FRONT;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.post("/create-stripe-account/:provider_id", async (req, res) => {
  try {
    const { provider_id } = req.params;

    const providerRes = await pool.query(
      `SELECT u.email
   FROM providers p
   JOIN users u ON p.user_id = u.user_id
   WHERE p.provider_id = $1`,
      [provider_id]
    );

    const providerEmail = providerRes.rows[0]?.email;

    if (!providerEmail)
      return res.status(404).json({ error: "Provider not found" });
    const account = await stripe.accounts.create({
      type: "express",
      country: "JO",
      email: providerEmail,
      capabilities: {
        transfers: { requested: true },
      },
      tos_acceptance: {
        service_agreement: "recipient",
      },
    });

    await pool.query(
      "UPDATE providers SET stripe_account_id = $1 WHERE provider_id = $2",
      [account.id, provider_id]
    );

    res.json({
      message: "Stripe account created successfully",
      stripe_account_id: account.id,
    });
  } catch (error) {
    console.error("Error creating Stripe account:", error);
    res.status(500).json({ error: "Failed to create Stripe account" });
  }
});
router.get("/create-account-link/:provider_id", async (req, res) => {
  try {
    const { provider_id } = req.params;

    const result = await pool.query(
      "SELECT stripe_account_id FROM providers WHERE provider_id = $1",
      [provider_id]
    );
    const accountId = result.rows[0]?.stripe_account_id;

    if (!accountId)
      return res
        .status(400)
        .json({ error: "Provider does not have a Stripe account yet" });

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `https://frontend-fzb2.onrender.com/reauth`,
      return_url: `https://frontend-fzb2.onrender.com/paymentsProvider`,
      type: "account_onboarding",
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error("Error creating account link:", error);
    res.status(500).json({ error: "Failed to create account link" });
  }
});
router.post("/transfer-to-provider/:provider_id", async (req, res) => {
  try {
    const { provider_id } = req.params;
    const { amount } = req.body;

    const result = await pool.query(
      "SELECT stripe_account_id FROM providers WHERE provider_id = $1",
      [provider_id]
    );
    const stripeAccountId = result.rows[0]?.stripe_account_id;

    if (!stripeAccountId)
      return res
        .status(400)
        .json({ error: "Provider does not have a connected Stripe account" });

    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      destination: stripeAccountId,
      transfer_group: `PROVIDER_${provider_id}`,
    });

    const updateResult = await pool.query(
      `UPDATE provider_balance 
   SET total_balance = total_balance - $1
   WHERE provider_id = $2`,
      [amount, provider_id]
    );
    console.log("Update result:", updateResult.rowCount);

    res.json({
      message: "Transfer successful",
      transfer_id: transfer.id,
    });
  } catch (error) {
    console.error("Error transferring funds:", error);
    res
      .status(500)
      .json({ error: "Failed to transfer funds", details: error.message });
  }
});
router.get("/check-account-status/:provider_id", async (req, res) => {
  try {
    const { provider_id } = req.params;

    const result = await pool.query(
      "SELECT stripe_account_id FROM providers WHERE provider_id = $1",
      [provider_id]
    );

    const stripeAccountId = result.rows[0]?.stripe_account_id;
    if (!stripeAccountId) {
      return res.status(404).json({ error: "Stripe account not found" });
    }

    const account = await stripe.accounts.retrieve(stripeAccountId);

    const status =
      account.charges_enabled && account.details_submitted
        ? "enabled"
        : "pending";

    res.json({
      status,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    });
  } catch (error) {
    console.error("Error checking account status:", error);
    res.status(500).json({ error: "Failed to check account status" });
  }
});

router.post("/add-test-funds", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Add Test Funds" },
            unit_amount: 99999999,
          },
          quantity: 1,
        },
      ],
      success_url: "https://frontend-fzb2.onrender.com/success",
      cancel_url: "https://frontend-fzb2.onrender.com/cancel",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
