const express = require("express");
const Stripe = require("stripe");
const pg = require("pg");
require("dotenv").config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// router.post("/save-payment", async (req, res) => {
//   try {
//     const { session_id } = req.body;

//     const session = await stripe.checkout.sessions.retrieve(session_id, {
//       expand: ["line_items"],
//     });

//     // await new Promise((r) => setTimeout(r, 3000));

//     const paymentIntent = await stripe.paymentIntents.retrieve(
//       session.payment_intent,
//       {
//         expand: ["charges.data.payment_method_details"],
//       }
//     );

//     let card_brand = null;
//     let card_last4 = null;
//     let card_exp_month = null;
//     let card_exp_year = null;

//     if (
//       paymentIntent.charges &&
//       paymentIntent.charges.data &&
//       paymentIntent.charges.data.length > 0
//     ) {
//       const charge = paymentIntent.charges.data[0];
//       const cardInfo = charge.payment_method_details?.card;

//       if (cardInfo) {
//         card_brand = cardInfo.brand;
//         card_last4 = cardInfo.last4;
//         card_exp_month = cardInfo.exp_month;
//         card_exp_year = cardInfo.exp_year;
//       } else if (charge.payment_method) {
//         const paymentMethod = await stripe.paymentMethods.retrieve(
//           charge.payment_method
//         );
//         if (paymentMethod?.card) {
//           card_brand = paymentMethod.card.brand;
//           card_last4 = paymentMethod.card.last4;
//           card_exp_month = paymentMethod.card.exp_month;
//           card_exp_year = paymentMethod.card.exp_year;
//         }
//       }
//     } else {
//       console.warn(
//         "⚠️ No charge data found for this PaymentIntent:",
//         session.id
//       );
//     }

//     const amount = session.amount_total / 100;
//     const currency = session.currency;
//     const email = session.customer_email;
//     const status = session.payment_status || "paid";
//     const metadata = session.metadata || {};
//     const cart_ids = metadata.cart_ids ? metadata.cart_ids.split(",") : [];
//     const customer_id = metadata.customer_id || null;

//     const provider_id = metadata.provider_id || null;

//     console.log(
//       "provider_idprovider_idprovider_idprovider_idprovider_idprovider_idprovider_idprovider_idprovider_idprovider_id"
//     );
//     console.log(provider_id);

//     console.log(
//       "provider_idprovider_idprovider_idprovider_idprovider_idprovider_idprovider_idprovider_idprovider_idprovider_id"
//     );
//     await pool.query(
//       `INSERT INTO stripe_payments
//        (stripe_payment_id, customer_id, provider_id, amount, currency, status, cart_ids, email, card_brand, card_last4, card_exp_month, card_exp_year, payment_date)
//        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, NOW())`,
//       [
//         session.id,
//         customer_id,
//         provider_id,
//         amount,
//         currency,
//         status,
//         cart_ids,
//         email,
//         card_brand,
//         card_last4,
//         card_exp_month,
//         card_exp_year,
//       ]
//     );

//     if (provider_id) {
//       await pool.query(
//         `INSERT INTO provider_balance (provider_id, total_balance)
//          VALUES ($1, $2)
//          ON CONFLICT (provider_id)
//          DO UPDATE SET total_balance = provider_balance.total_balance + EXCLUDED.total_balance;`,
//         [provider_id, amount]
//       );
//     } else {
//       console.warn(
//         `⚠️ Skipped provider balance update because provider_id is null for session ${session.id}`
//       );
//     }

//     res.json({ message: "Payment saved successfully", session });
//   } catch (err) {
//     console.error("Error saving payment:", err);
//     res
//       .status(500)
//       .json({ error: "Failed to save payment", details: err.message });
//   }
// });
// router.post("/save-payment", async (req, res) => {
//   try {
//     const { session_id } = req.body;

//     // ✅ جلب بيانات الجلسة من Stripe
//     const session = await stripe.checkout.sessions.retrieve(session_id, {
//       expand: ["line_items.data.price.product"],
//     });
//     console.log(
//       "🧾 Line items from Stripe:",
//       JSON.stringify(session.line_items, null, 2)
//     );

//     const paymentIntent = await stripe.paymentIntents.retrieve(
//       session.payment_intent,
//       { expand: ["charges.data.payment_method_details"] }
//     );

//     // 🧾 معلومات البطاقةس
//     let card_brand = null,
//       card_last4 = null,
//       card_exp_month = null,
//       card_exp_year = null;
//     if (
//       paymentIntent?.charges?.data?.length > 0 &&
//       paymentIntent.charges.data[0].payment_method_details?.card
//     ) {
//       const card = paymentIntent.charges.data[0].payment_method_details.card;
//       card_brand = card.brand;
//       card_last4 = card.last4;
//       card_exp_month = card.exp_month;
//       card_exp_year = card.exp_year;
//     }

//     // ✅ بيانات عامة من الجلسة
//     const email = session.customer_email;
//     const status = session.payment_status || "paid";
//     const currency = session.currency;
//     const amount_total = session.amount_total / 100;
//     const customer_id = session.metadata?.customer_id || null;
//     const cart_ids = session.metadata?.cart_ids
//       ? session.metadata.cart_ids.split(",")
//       : [];

//     // ✅ جلب line items (المنتجات المشتراة)
//     const lineItems = session.line_items?.data || [];

//     // ⚡️ توزيع المبلغ حسب provider
//     const providerTotals = {};

//     for (const item of lineItems) {
//       const providerId = item.price.metadata?.provider_id;
//       const price = item.amount_total / 100;

//       if (providerId) {
//         if (!providerTotals[providerId]) providerTotals[providerId] = 0;
//         providerTotals[providerId] += price;
//       }
//     }

//     // ✅ إدخال دفعة لكل مزود في stripe_payments وتحديث رصيده
//     for (const providerId in providerTotals) {
//       const providerAmount = providerTotals[providerId];

//       await pool.query(
//         `INSERT INTO stripe_payments
//         (stripe_payment_id, customer_id, provider_id, amount, currency, status, cart_ids, email, card_brand, card_last4, card_exp_month, card_exp_year, payment_date)
//         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())`,
//         [
//           session.id,
//           customer_id,
//           providerId,
//           providerAmount,
//           currency,
//           status,
//           cart_ids,
//           email,
//           card_brand,
//           card_last4,
//           card_exp_month,
//           card_exp_year,
//         ]
//       );

//       // تحديث أو إدخال الرصيد للمزود
//       await pool.query(
//         `INSERT INTO provider_balance (provider_id, total_balance)
//          VALUES ($1, $2)
//          ON CONFLICT (provider_id)
//          DO UPDATE SET total_balance = provider_balance.total_balance + EXCLUDED.total_balance;`,
//         [providerId, providerAmount]
//       );

//       console.log(`💰 Added $${providerAmount} to provider ${providerId}`);
//     }

//     console.log("✅ All provider balances updated successfully!");
//     res.json({ message: "Payments saved for all providers", session });
//   } catch (err) {
//     console.error("❌ Error saving payment:", err);
//     res.status(500).json({
//       error: "Failed to save payment",
//       details: err.message,
//     });
//   }
// });
const base64url = require("base64url");

// router.post("/save-payment", async (req, res) => {
//   try {
//     const { session_id } = req.body;
//     const session = await stripe.checkout.sessions.retrieve(session_id, {
//       expand: ["payment_intent", "line_items"],
//     });

//     let metadata = session.metadata;

//     // ✅ تحقق من الـ payment_intent بشكل آمن
//     const paymentIntentId =
//       typeof session.payment_intent === "string"
//         ? session.payment_intent
//         : session.payment_intent?.id;

//     if (!metadata?.mapping && paymentIntentId) {
//       const paymentIntent = await stripe.paymentIntents.retrieve(
//         paymentIntentId
//       );
//       metadata = paymentIntent.metadata || metadata;
//     }

//     console.log("🧩 Final metadata:", metadata);

//     let mapping = [];
//     if (metadata?.mapping) {
//       try {
//         mapping = JSON.parse(base64url.decode(metadata.mapping));
//       } catch (err) {
//         console.warn("⚠️ Failed to decode mapping:", err.message);
//       }
//     } else {
//       console.warn("⚠️ No mapping field found in final metadata");
//     }

//     console.log("📦 Decoded mapping:", mapping);

//     const lineItems = session.line_items?.data || [];
//     const providerTotals = {};

//     lineItems.forEach((item, idx) => {
//       const map = mapping[idx];
//       if (!map) return;
//       const providerId = map.provider_id;
//       const amount = item.amount_total / 100;
//       if (!providerTotals[providerId]) providerTotals[providerId] = 0;
//       providerTotals[providerId] += amount;
//     });

//     // 💰 تحديث الدفع والرصيد لكل مزود
//     for (const providerId in providerTotals) {
//       const amount = providerTotals[providerId];
//       await pool.query(
//         `INSERT INTO stripe_payments
//          (stripe_payment_id, customer_id, provider_id, amount, currency, status, cart_ids, email,
//           payment_date)
//          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
//         [
//           session.id,
//           session.metadata?.customer_id,
//           providerId,
//           amount,
//           session.currency,
//           session.payment_status || "paid",
//           session.metadata?.cart_ids,
//           session.customer_email,
//         ]
//       );

//       await pool.query(
//         `INSERT INTO provider_balance (provider_id, total_balance)
//          VALUES ($1,$2)
//          ON CONFLICT (provider_id)
//          DO UPDATE SET total_balance = provider_balance.total_balance + EXCLUDED.total_balance;`,
//         [providerId, amount]
//       );

//       console.log(`💰 Provider ${providerId} received ${amount} USD`);
//     }

//     console.log("✅ All provider balances updated successfully");
//     res.json({ message: "Payments saved successfully" });
//   } catch (err) {
//     console.error("❌ Error saving payment:", err);
//     res.status(500).json({ error: err.message });
//   }
// });
router.post("/save-payment", async (req, res) => {
  try {
    const { session_id } = req.body;
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent", "line_items"],
    });

    let metadata = session.metadata;
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    if (!metadata?.mapping && paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );
      metadata = paymentIntent.metadata || metadata;
    }

    const mapping = metadata?.mapping
      ? JSON.parse(base64url.decode(metadata.mapping))
      : [];

    const lineItems = session.line_items?.data || [];
    const providerTotals = {};

    // 🔹 وزّع كل منتج حسب المزوّد تبعه
    lineItems.forEach((item, idx) => {
      const map = mapping[idx];
      if (!map) return;
      const providerId = map.provider_id;
      const amount = item.amount_total / 100;

      if (!providerTotals[providerId]) providerTotals[providerId] = 0;
      providerTotals[providerId] += amount;
    });

    // 🔹 خزّن المدفوعات وحدث أرصدة المزودين
    for (const providerId in providerTotals) {
      const amount = providerTotals[providerId];
      await pool.query(
        `INSERT INTO stripe_payments
         (stripe_payment_id, customer_id, provider_id, amount, currency, status, cart_ids, email, payment_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
        [
          session.id,
          metadata.customer_id,
          providerId,
          amount,
          session.currency,
          session.payment_status || "paid",
          metadata.cart_ids,
          session.customer_email,
        ]
      );

      await pool.query(
        `INSERT INTO provider_balance (provider_id, total_balance)
         VALUES ($1,$2)
         ON CONFLICT (provider_id)
         DO UPDATE SET total_balance = provider_balance.total_balance + EXCLUDED.total_balance;`,
        [providerId, amount]
      );

      console.log(`💰 Provider ${providerId} received ${amount} USD`);
    }

    res.json({ message: "Payments saved successfully" });
  } catch (err) {
    console.error("❌ Error saving payment:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
