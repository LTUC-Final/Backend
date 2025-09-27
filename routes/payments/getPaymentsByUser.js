// routes/payments/getPaymentsByUser.js
// routes/payments/getPaymentsByUser.js
const express = require("express");
const pg = require("pg");
require("dotenv").config();

const router = express.Router();
router.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// ✅ Get all payments for a specific customer
router.get("/user/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status } = req.query;

    console.log("📥 Fetching payments for user:", customerId, "status filter:", status);

    let query = `
      SELECT 
        p.payment_id,
        p.amount,
        p.method,
        p.status,
        p.transaction_id,
        p.transaction_date,
        p.cart_id,
        p.order_id,

        -- Final price: من products أو orders أو amount
        COALESCE(pr.price, o.original_price, p.amount) AS final_price,

        -- Product name
        pr.name AS product_name,

        -- Customer info
        u.firstname AS customer_firstname,
        u.lastname AS customer_lastname,

        -- Provider info
        up.firstname AS provider_firstname,
        up.lastname AS provider_lastname
      FROM payments p
      LEFT JOIN cart c ON p.cart_id = c.cart_id
      LEFT JOIN orders o ON p.order_id = o.order_id
      LEFT JOIN products pr 
        ON pr.product_id = COALESCE(c.product_id, o.product_id)
      JOIN users u ON p.customer_id = u.user_id
      LEFT JOIN providers prov ON pr.provider_id = prov.provider_id
      LEFT JOIN users up ON prov.user_id = up.user_id
      WHERE p.customer_id = $1
    `;

    const params = [customerId];

    if (status) {
      query += " AND p.status = $2";
      params.push(status);
    }

    query += " ORDER BY p.transaction_date DESC";

    const result = await pool.query(query, params);

    console.log("✅ Payments fetched:", result.rows);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching payments:", err);
    res.status(500).json({ error: "Server error while fetching payments" });
  }
});

module.exports = router;
