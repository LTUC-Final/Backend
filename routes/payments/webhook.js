// // // routes/payments/webhook.js
// // const express = require("express");
// // const Stripe = require("stripe");
// // const pg = require("pg");
// // require("dotenv").config();

// // const router = express.Router();
// // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// // const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// // // استخدم body-parser raw لمطابقة توقيع Stripe
// // router.post(
// //   "/stripe-webhook",
// //   express.raw({ type: "application/json" }),
// //   async (req, res) => {
// //     const sig = req.headers["stripe-signature"];
// //     const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// //     let event;
// //     try {
// //       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
// //     } catch (err) {
// //       console.log("Webhook signature verification failed.", err.message);
// //       return res.status(400).send(`Webhook Error: ${err.message}`);
// //     }
// //     console.log("✅ Stripe webhook called!");
// //     console.log("Event type:", event.type);

// //     if (event.type === "checkout.session.completed") {
// //       const session = event.data.object;
// //       const userId = session.metadata.customer_id;
// //       console.log("Customer ID from metadata:", userId);

// //       try {
// //         const cartItems = await pool.query(
// //           `SELECT * FROM cart WHERE customer_id = $1 AND status_pay = 'Approve'`,
// //           [userId]
// //         );

// //         if (cartItems.rows.length === 0) {
// //           console.log("No approved cart items found for user:", userId);
// //         } else {
// //           for (const item of cartItems.rows) {
// //             const status = "pending";

// //             await pool.query(
// //               `INSERT INTO orders
// //               (details_order_user, original_price, provider_id, product_id, quantity, customer_id, status, cart_id)
// //               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
// //               [
// //                 item.custom_requirement,
// //                 item.price,
// //                 item.provider_id,
// //                 item.product_id,
// //                 item.quantity,
// //                 item.customer_id,
// //                 status,
// //                 item.cart_id,
// //               ]
// //             );

// //             await pool.query(
// //               `UPDATE products
// //                SET timesordered = COALESCE(timesordered, 0) + 1
// //                WHERE product_id = $1`,
// //               [item.product_id]
// //             );
// //           }

// //           await pool.query(
// //             `DELETE FROM cart WHERE customer_id = $1 AND status_pay = 'Approve'`,
// //             [userId]
// //           );

// //           console.log(`Cart items moved to orders successfully for user: ${userId}`);
// //         }
// //       } catch (err) {
// //         console.error("Error moving cart items to orders:", err);
// //       }
// //     }

// //     res.json({ received: true });
// //   }
// // );

// // module.exports = router;
// const express = require("express");
// const Stripe = require("stripe");
// const pg = require("pg");
// require("dotenv").config();

// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// // استخدام raw body لمطابقة توقيع Stripe
// router.post(
//   "/stripe-webhook",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     const sig = req.headers["stripe-signature"];
//     const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

//     let event;
//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     } catch (err) {
//       console.log("Webhook signature verification failed:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     console.log("✅ Stripe webhook called!");
//     console.log("Event type:", event.type);

//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;
//       const userId = session.metadata.customer_id;

//       if (!userId) {
//         console.error("No customer_id in metadata!");
//         return res.status(400).send("Missing customer_id");
//       }

//       try {
//         // الكويري هنا تبقى كما هي
//         const cartItems = await pool.query(
//           `SELECT * FROM cart WHERE customer_id = $1 AND status_pay = 'Approve'`,
//           [userId]
//         );

//         if (cartItems.rows.length === 0) {
//           console.log("No approved cart items found for user:", userId);
//         } else {
//           for (const item of cartItems.rows) {
//             const status = "pending";
//             await pool.query(
//               `INSERT INTO orders
//             (details_order_user, original_price, provider_id, product_id, quantity, customer_id, status, cart_id)
//             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
//               [
//                 item.custom_requirement,
//                 item.price,
//                 item.provider_id,
//                 item.product_id,
//                 item.quantity,
//                 item.customer_id,
//                 status,
//                 item.cart_id,
//               ]
//             );

//             await pool.query(
//               `UPDATE products
//              SET timesordered = COALESCE(timesordered, 0) + 1
//              WHERE product_id = $1`,
//               [item.product_id]
//             );
//           }

//           // مسح الكارت بعد الدفع
//           await pool.query(
//             `DELETE FROM cart WHERE customer_id = $1 AND status_pay = 'Approve'`,
//             [userId]
//           );

//           console.log(
//             `Cart items moved to orders successfully for user: ${userId}`
//           );
//         }
//       } catch (err) {
//         console.error("Error moving cart items to orders:", err);
//       }
//     }

//     res.json({ received: true });
//   }
// );

// module.exports = router;
