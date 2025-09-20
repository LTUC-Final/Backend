// routes/payments/getPaymentsByUser.js
const express = require("express");
const pg = require("pg");
require("dotenv").config();

const router = express.Router();
router.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Get all payments for a specific customer with optional status filter
router.get("/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status } = req.query; // optional: ?status=paid

    let query = `
      SELECT 
        p.*,
        c.cart_id,
        o.order_id,
        COALESCE(c.price, o.original_price) AS final_price,
        c.custom_requirement,
        c.provider_response,
        pr.name AS product_name,
        u.firstname AS customer_firstname,
        u.lastname AS customer_lastname,
        up.firstname AS provider_firstname,
        up.lastname AS provider_lastname
      FROM payments p
      LEFT JOIN cart c ON p.cart_id = c.cart_id
      LEFT JOIN orders o ON p.order_id = o.order_id
      JOIN products pr ON (c.product_id = pr.product_id OR o.product_id = pr.product_id)
      JOIN users u ON p.customer_id = u.user_id
      JOIN providers prov ON pr.provider_id = prov.provider_id
      JOIN users up ON prov.user_id = up.user_id
      WHERE p.customer_id = $1
    `;

    const params = [customerId];

    if (status) {
      query += " AND p.status = $2";
      params.push(status);
    }

    query += " ORDER BY p.transaction_date DESC";

    const result = await pool.query(query, params);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ error: "Server error while fetching payments" });
  }
});

module.exports = router