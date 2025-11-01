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

// router.post("/create-multi-provider-sessions", async (req, res) => {
//   try {
//     const { customer_id, email, products } = req.body;

//     ////////////////////////
//     console.log("🧾 Received payment request:");
//     console.log("Customer ID:", customer_id);
//     console.log("Email:", email);
//     console.log("Products:", JSON.stringify(products, null, 2));

//     if (!products || !Array.isArray(products) || !products.length) {
//       return res
//         .status(400)
//         .json({ error: "Products array is empty or invalid" });
//     }

//     const providersMap = {};
//     for (const item of products) {
//       if (!item.provider_id) continue;
//       if (!providersMap[item.provider_id]) providersMap[item.provider_id] = [];
//       providersMap[item.provider_id].push(item);
//     }

//     const sessions = [];

//     for (const provider_id in providersMap) {
//       const items = providersMap[provider_id];

//       const providerResult = await pool.query(
//         "SELECT stripe_account_id FROM providers WHERE provider_id = $1",
//         [provider_id]
//       );
//       const stripeAccountId = providerResult.rows[0]?.stripe_account_id;

//       if (!stripeAccountId) {
//         console.warn(
//           `❌ Provider ${provider_id} has no connected Stripe account`
//         );
//         continue;
//       }

//       const lineItems = items
//         .map((item) => {
//           const rawPrice = item.price || item.cart_price;
//           const priceNum = Number(
//             typeof rawPrice === "string"
//               ? rawPrice.replace(/[^0-9.]/g, "")
//               : rawPrice
//           );

//           if (isNaN(priceNum) || priceNum <= 0) {
//             console.warn(
//               `⚠️ Skipped product because of invalid price: product_id=${item.product_id}, price=${item.price}`
//             );
//             return null;
//           }

//           return {
//             price_data: {
//               currency: "usd",
//               product_data: {
//                 name: item.name || `Product ${item.product_id}`,
//                 images: item.image
//                   ? [`http://localhost:${port}/uploads/${item.image}`]
//                   : [],
//               },
//               unit_amount: Math.round(priceNum * 100),
//             },
//             quantity: item.quantity || 1,
//           };
//         })
//         .filter(Boolean);

//       if (!lineItems.length) {
//         console.warn(`⚠️ Skipped provider ${provider_id}: no valid products`);
//         continue;
//       }

//       const session = await stripe.checkout.sessions.create({
//         payment_method_types: ["card"],
//         mode: "payment",
//         line_items: lineItems,
//         customer_email: email,
//         metadata: {
//           customer_id,
//           provider_id,
//         },
//         payment_intent_data: {
//           transfer_data: {
//             destination: stripeAccountId,
//           },
//         },
//         success_url: `http://localhost:${portFront}/success?session_id={CHECKOUT_SESSION_ID}`,
//         cancel_url: `http://localhost:${portFront}/cancel`,
//       });

//       sessions.push({
//         provider_id,
//         session_id: session.id,
//         url: session.url,
//       });
//     }

//     if (!sessions.length) {
//       return res.status(400).json({
//         error:
//           "No valid Stripe sessions were created. Check product prices or provider accounts.",
//       });
//     }

//     console.log("✅ Created Stripe Sessions:", sessions);
//     res.json({ sessions });
//   } catch (error) {
//     console.error("❌ Error creating multi-provider sessions:", error);
//     res.status(500).json({
//       error: "Failed to create checkout sessions",
//       details: error.message,
//     });
//   }
// });
router.post("/create-multi-provider-sessions", async (req, res) => {
  try {
    const { customer_id, email, products } = req.body;
    console.log("🧾 Received payment request:");
    console.log("Customer ID:", customer_id);
    console.log("Email:", email);
    console.log("Products:", JSON.stringify(products, null, 2));

    if (!products || !Array.isArray(products) || !products.length) {
      return res
        .status(400)
        .json({ error: "Products array is empty or invalid" });
    }

    const providersMap = {};
    for (const item of products) {
      if (!item.provider_id) {
        console.warn(" Product missing provider_id:", item);
        continue;
      }
      if (!providersMap[item.provider_id]) providersMap[item.provider_id] = [];
      providersMap[item.provider_id].push(item);
    }

    console.log("📦 Grouped providers:", Object.keys(providersMap));

    const sessions = [];
    for (const provider_id in providersMap) {
      const items = providersMap[provider_id];
      const cartIds = items
        .map((p) => p.cart_id)
        .filter((id) => id !== undefined && id !== null)
        .join(",");
      const lineItems = products
        .map((item) => {
          const rawPrice = item.price || item.cart_price;
          const priceNum = Number(
            typeof rawPrice === "string"
              ? rawPrice.replace(/[^0-9.]/g, "")
              : rawPrice
          );

          if (isNaN(priceNum) || priceNum <= 0) {
            console.warn(`⚠️ Invalid price for product ${item.product_id}`);
            return null;
          }

          return {
            price_data: {
              currency: "usd",
              metadata: {
                provider_id: String(item.provider_id),
              },
              product_data: {
                name:
                  item.product_name ||
                  item.name ||
                  `Product ${item.product_id}`,
                images: item.image
                  ? [`http://localhost:${portFront}/uploads/${item.image}`]
                  : [],
              },
              unit_amount: Math.round(priceNum * 100),
            },
            quantity: item.quantity || 1,
          };
        })
        .filter(Boolean);
      if (!lineItems.length) {
        console.warn(`⚠️ Skipped provider ${provider_id}: no valid products`);
        continue;
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: lineItems,
        customer_email: email,
        metadata: {
          customer_id,
          provider_id,
          cart_ids: cartIds,
        },
        success_url: `http://localhost:${portFront}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:${portFront}/cancel`,
      });

      sessions.push({
        provider_id,
        session_id: session.id,
        url: session.url,
      });
    }
    if (!sessions.length) {
      return res.status(400).json({
        error:
          "No valid Stripe sessions were created. Check product prices or provider IDs.",
      });
    }

    console.log("✅ Created Stripe Sessions:", sessions);
    console.log("✅ Created Sessions Count:", sessions.length);
    sessions.forEach((s) => console.log(s.provider_id, s.url));

    res.json({ sessions });
  } catch (error) {
    console.error("❌ Error creating multi-provider sessions:", error);
    res.status(500).json({
      error: "Failed to create checkout sessions",
      details: error.message,
    });
  }
});
// ✅ توحيد الدفع لجميع المزوّدين بجلسة واحدة فقط
// router.post("/create-checkout-session-all", async (req, res) => {
//   try {
//     const { customer_id, email, products } = req.body;
//     console.log("🧾 Received unified payment request");
//     console.log("Customer ID:", customer_id);
//     console.log("Email:", email);
//     console.log("Products:", JSON.stringify(products, null, 2));

//     if (!products || !Array.isArray(products) || !products.length) {
//       return res.status(400).json({ error: "Products array is empty or invalid" });
//     }

//     // ✅ بناء line_items تشمل جميع المنتجات من جميع المزوّدين
//     const lineItems = products
//       .map((item) => {
//         const rawPrice = item.price || item.cart_price;
//         const priceNum = Number(
//           typeof rawPrice === "string" ? rawPrice.replace(/[^0-9.]/g, "") : rawPrice
//         );

//         if (isNaN(priceNum) || priceNum <= 0) {
//           console.warn(`⚠️ Invalid price for product ${item.product_id}`);
//           return null;
//         }

//         return {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: item.product_name || item.name || `Product ${item.product_id}`,
//               images: item.image
//                 ? [`http://localhost:${portFront}/uploads/${item.image}`]
//                 : [],
//               metadata: {
//                 provider_id: item.provider_id,
//               },
//             },
//             unit_amount: Math.round(priceNum * 100),
//           },
//           quantity: item.quantity || 1,
//         };
//       })
//       .filter(Boolean);

//     if (!lineItems.length)
//       return res.status(400).json({ error: "No valid products for checkout" });

//     // ✅ إنشاء جلسة دفع واحدة فقط لجميع المزوّدين
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       line_items: lineItems,
//       customer_email: email,
//       metadata: {
//         customer_id,
//         provider_ids: [...new Set(products.map((p) => p.provider_id))].join(","),
//         cart_ids: products.map((p) => p.cart_id).join(","),
//       },
//       success_url: `http://localhost:${portFront}/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `http://localhost:${portFront}/cancel`,
//     });

//     console.log("✅ Created unified Stripe session:", session.id);
//     res.json({ id: session.id, url: session.url });
//   } catch (error) {
//     console.error("❌ Error creating unified checkout session:", error);
//     res.status(500).json({
//       error: "Failed to create unified checkout session",
//       details: error.message,
//     });
//   }
// });
const base64url = require("base64url");

// router.post("/create-checkout-session-all", async (req, res) => {
//   try {
//     const { customer_id, email, products } = req.body;

//     console.log("🧾 Received unified payment request");
//     console.log("Customer ID:", customer_id);
//     console.log("Email:", email);
//     console.log("Products:", products);

//     if (!products || !Array.isArray(products) || !products.length) {
//       return res.status(400).json({ error: "Products array is empty or invalid" });
//     }

//     // ✅ جهّز mapping لتربط كل منتج بالمزوّد تبعه
//     const mapping = products.map((item) => ({
//       product_id: item.product_id,
//       provider_id: item.provider_id,
//       cart_id: item.cart_id,
//       price: item.price,
//     }));

//     // 🔐 شفر mapping بصيغة base64url حتى Stripe يقبله
//     const encodedMapping = base64url.encode(JSON.stringify(mapping));

//     console.log("🧩 Encoded mapping:", encodedMapping);

//     // ✅ بناء line_items بطريقة آمنة
//     const lineItems = products
//       .map((item) => {
//         const priceNum = parseFloat(item.price || item.cart_price || 0);
//         if (isNaN(priceNum) || priceNum <= 0) {
//           console.warn(`⚠️ Skipped invalid price for product ${item.product_id}`);
//           return null;
//         }

//         return {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: item.product_name || item.name || `Product ${item.product_id}`,
//               images: item.product_image
//                 ? [`http://localhost:${portFront}${item.product_image}`]
//                 : [],
//             },
//             unit_amount: Math.round(priceNum * 100),
//           },
//           quantity: item.quantity || 1,
//         };
//       })
//       .filter(Boolean);

//     // ✅ إنشاء جلسة Stripe تشمل mapping في metadata
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       line_items: lineItems,
//       customer_email: email,
//       metadata: {
//         customer_id,
//         cart_ids: products.map((p) => p.cart_id).join(","),
//         mapping: encodedMapping, // 🧩 هذا هو المفتاح المهم
//       },
//       success_url: `http://localhost:${portFront}/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `http://localhost:${portFront}/cancel`,
//     });

//     console.log("✅ Created unified Stripe session:", session.id);
//     console.log("🧩 Sent metadata:", session.metadata);

//     res.json({ id: session.id, url: session.url });
//   } catch (error) {
//     console.error("❌ Error creating unified checkout session:", error);
//     res.status(500).json({
//       error: "Failed to create unified checkout session",
//       details: error.message,
//     });
//   }
// });

// router.post("/create-checkout-session-all", async (req, res) => {
//   try {
//     const { customer_id, email, products } = req.body;

//     if (!products?.length)
//       return res
//         .status(400)
//         .json({ error: "Products array is empty or invalid" });

//     // ⚙️ mapping بسيط من كل منتج إلى مزوده
//     const mapping = products.map((p) => ({
//       product_id: p.product_id,
//       provider_id: p.provider_id,
//     }));

//     // نحوله إلى Base64 حتى Stripe ما يتجاهله
//     const mappingEncoded = base64url.encode(JSON.stringify(mapping));

//     const lineItems = products.map((item) => ({
//       price_data: {
//         currency: "usd",
//         product_data: {
//           name: item.product_name || item.name || `Product ${item.product_id}`,
//           images: item.image
//             ? [`http://localhost:${portFront}/uploads/${item.image}`]
//             : [],
//         },
//         unit_amount: Math.round(Number(item.price || item.cart_price) * 100),
//       },
//       quantity: item.quantity || 1,
//     }));

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       line_items: lineItems,
//       customer_email: email,
//       metadata: {
//         customer_id,
//         cart_ids: products.map((p) => p.cart_id).join(","),
//         mapping: mappingEncoded, // ✅ Base64 encoded
//       },
//       success_url: `http://localhost:${portFront}/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `http://localhost:${portFront}/cancel`,
//     });

//     console.log("✅ Created unified Stripe session:", session.id);
//     res.json({ id: session.id, url: session.url });
//   } catch (error) {
//     console.error("❌ Error creating unified checkout session:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// router.post("/create-checkout-session-all", async (req, res) => {
//   try {
//     const { customer_id, email, products } = req.body;

//     console.log("🧾 Received unified payment request");
//     console.log("Customer ID:", customer_id);
//     console.log("Email:", email);
//     console.log("Products:", products);

//     if (!products || !Array.isArray(products) || !products.length) {
//       return res
//         .status(400)
//         .json({ error: "Products array is empty or invalid" });
//     }

//     // ✅ جهّز mapping لتربط كل منتج بالمزوّد تبعه
//     const mapping = products.map((item) => ({
//       product_id: item.product_id,
//       provider_id: item.provider_id,
//       cart_id: item.cart_id,
//       price: item.price,
//     }));

//     // 🔐 شفر mapping بصيغة base64url حتى Stripe يقبله بأمان
//     const encodedMapping = base64url.encode(JSON.stringify(mapping));

//     console.log("🧩 Encoded mapping:", encodedMapping);

//     // ✅ بناء line_items بطريقة آمنة
//     const lineItems = products
//       .map((item) => {
//         const priceNum = parseFloat(item.price || item.cart_price || 0);
//         if (isNaN(priceNum) || priceNum <= 0) {
//           console.warn(
//             `⚠️ Skipped invalid price for product ${item.product_id}`
//           );
//           return null;
//         }

//         return {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name:
//                 item.product_name || item.name || `Product ${item.product_id}`,
//               images: item.product_image
//                 ? [`http://localhost:${portFront}${item.product_image}`]
//                 : [],
//             },
//             unit_amount: Math.round(priceNum * 100),
//           },
//           quantity: item.quantity || 1,
//         };
//       })
//       .filter(Boolean);

//     // ✅ إنشاء جلسة Stripe تشمل mapping في metadata
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       line_items: lineItems,
//       customer_email: email,
//       metadata: {
//         customer_id,
//         cart_ids: products.map((p) => p.cart_id).join(","),
//         mapping: encodedMapping, // ⚡ هذا المفتاح هو الأهم
//       },
//       success_url: `http://localhost:${portFront}/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `http://localhost:${portFront}/cancel`,
//     });

//     console.log("✅ Created unified Stripe session:", session.id);
//     console.log("🧩 Sent metadata:", session.metadata);

//     res.json({ id: session.id, url: session.url });
//   } catch (error) {
//     console.error("❌ Error creating unified checkout session:", error);
//     res.status(500).json({
//       error: "Failed to create unified checkout session",
//       details: error.message,
//     });
//   }
// });

// router.post("/create-checkout-session-all", async (req, res) => {
//   try {
//     const { customer_id, email, products } = req.body;

//     console.log("🧾 Received unified payment request");
//     console.log("Customer ID:", customer_id);
//     console.log("Email:", email);
//     console.log("Products:", products);

//     if (!products || !Array.isArray(products) || !products.length) {
//       return res
//         .status(400)
//         .json({ error: "Products array is empty or invalid" });
//     }

//     // ✅ جهّز mapping لتربط كل منتج بالمزوّد تبعه
//     const mapping = products.map((item) => ({
//       product_id: item.product_id,
//       provider_id: item.provider_id,
//       cart_id: item.cart_id,
//       price: item.price,
//     }));

//     // 🔐 شفر mapping بصيغة base64url حتى Stripe يقبله بأمان
//     const encodedMapping = base64url.encode(JSON.stringify(mapping));
//     console.log("🧩 Encoded mapping:", encodedMapping);

//     // ✅ بناء line_items بطريقة آمنة
//     const lineItems = products
//       .map((item) => {
//         const priceNum = parseFloat(item.price || item.cart_price || 0);
//         if (isNaN(priceNum) || priceNum <= 0) {
//           console.warn(
//             `⚠️ Skipped invalid price for product ${item.product_id}`
//           );
//           return null;
//         }

//         return {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name:
//                 item.product_name || item.name || `Product ${item.product_id}`,
//               images: item.product_image
//                 ? [`http://localhost:${portFront}${item.product_image}`]
//                 : [],
//             },
//             unit_amount: Math.round(priceNum * 100),
//           },
//           quantity: item.quantity || 1,
//         };
//       })
//       .filter(Boolean);

//     // ✅ إنشاء جلسة Stripe تشمل mapping في metadata
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       line_items: lineItems,
//       customer_email: email,
//       metadata: {
//         customer_id,
//         cart_ids: products.map((p) => p.cart_id).join(","),
//         mapping: encodedMapping, // ⚡ هذا المفتاح هو الأهم
//       },
//       success_url: `http://localhost:${portFront}/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `http://localhost:${portFront}/cancel`,
//     });

//     console.log("✅ Created unified Stripe session:", session.id);
//     console.log("🧩 Sent metadata:", session.metadata);

//     res.json({ id: session.id, url: session.url });
//   } catch (error) {
//     console.error("❌ Error creating unified checkout session:", error);
//     res.status(500).json({
//       error: "Failed to create unified checkout session",
//       details: error.message,
//     });
//   }
// });
// router.post("/create-checkout-session-all", async (req, res) => {
//   try {
//     const { customer_id, email, products } = req.body;

//     console.log("🧾 Received unified payment request");
//     console.log("Customer ID:", customer_id);
//     console.log("Email:", email);
//     console.log("Products:", products);

//     if (!products || !Array.isArray(products) || !products.length) {
//       return res
//         .status(400)
//         .json({ error: "Products array is empty or invalid" });
//     }

//     // ✅ جهّز mapping لتربط كل منتج بالمزوّد تبعه
//     const mapping = products.map((item) => ({
//       product_id: item.product_id,
//       provider_id: item.provider_id,
//       cart_id: item.cart_id,
//       price: item.price,
//     }));

//     // 🔐 شفر mapping بصيغة base64url حتى Stripe يقبله بأمان
//     const encodedMapping = base64url.encode(JSON.stringify(mapping));

//     // ✅ بناء line_items
//     const lineItems = products.map((item) => ({
//       price_data: {
//         currency: "usd",
//         product_data: {
//           name: item.product_name || item.name || `Product ${item.product_id}`,
//           images: item.product_image
//             ? [`http://localhost:${portFront}${item.product_image}`]
//             : [],
//         },
//         unit_amount: Math.round(Number(item.price) * 100),
//       },
//       quantity: item.quantity || 1,
//     }));

//     // ✅ إنشاء جلسة Stripe
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       line_items: lineItems,
//       customer_email: email,
//       metadata: {
//         customer_id,
//         cart_ids: products.map((p) => p.cart_id).join(","),
//         mapping: encodedMapping, // 🧩 أهم جزء
//       },
//       success_url: `http://localhost:${portFront}/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `http://localhost:${portFront}/cancel`,
//     });

//     console.log("✅ Created unified Stripe session:", session.id);
//     console.log("🧩 Sent metadata:", session.metadata);

//     res.json({ id: session.id, url: session.url });
//   } catch (error) {
//     console.error("❌ Error creating unified checkout session:", error);
//     res.status(500).json({
//       error: "Failed to create unified checkout session",
//       details: error.message,
//     });
//   }
// });

router.post("/create-checkout-session-all", async (req, res) => {
  try {
    const { customer_id, email, products } = req.body;

    console.log("🧾 Received unified payment request");
    console.log("Customer ID:", customer_id);
    console.log("Email:", email);
    console.log("Products:", products);

    if (!products || !Array.isArray(products) || !products.length) {
      return res
        .status(400)
        .json({ error: "Products array is empty or invalid" });
    }
 const approvedProducts = products.filter(
      (p) => p.status_pay === "Approve"
    );

    if (!approvedProducts.length) {
      return res
        .status(400)
        .json({ error: "No approved products found for checkout" });
    }
    const mapping = approvedProducts.map((item) => ({
      product_id: item.product_id,
      provider_id: item.provider_id,
      cart_id: item.cart_id,
      price: item.price,
    }));

    const encodedMapping = base64url.encode(JSON.stringify(mapping));

    const lineItems = approvedProducts
      .map((item) => {
        const rawPrice = item.price || item.cart_price || 0;
        const priceNum = Number(
          typeof rawPrice === "string"
            ? rawPrice.replace(/[^0-9.]/g, "")
            : rawPrice
        );

        if (isNaN(priceNum) || priceNum <= 0) {
          console.warn(
            `⚠️ Skipped invalid price for product_id=${item.product_id}, price=${item.price}`
          );
          return null;     }

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name:
                item.product_name || item.name || `Product ${item.product_id}`,
              images: item.product_image
                ? [`http://localhost:${portFront}${item.product_image}`]
                : [],
            },
            unit_amount: Math.round(priceNum * 100), 
          },
          quantity: item.quantity || 1,
        };
      })
      .filter(Boolean);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      customer_email: email,
      metadata: {
        customer_id,
        cart_ids: approvedProducts.map((p) => p.cart_id).join(","),
        mapping: encodedMapping,
      },
      success_url: `http://localhost:${portFront}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:${portFront}/cancel`,
    });

    console.log(" Created unified Stripe session:", session.id);
    console.log(" Sent metadata:", session.metadata);

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error(" Error creating unified checkout session:", error);
    res.status(500).json({
      error: "Failed to create unified checkout session",
      details: error.message,
    });
  }
});

module.exports = router;
