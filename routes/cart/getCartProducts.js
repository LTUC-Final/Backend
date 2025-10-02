//routes/getCartProducts.js
const express = require("express");
const pg = require("pg");
require("dotenv").config();

const router = express.Router();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id) return res.status(400).json({ error: "user_id is required" });

    const result = await pool.query(
      `SELECT 
         c.cart_id,
         c.customer_id,
         c.provider_id,
         c.product_id,
         c.sendedtoprovider,
         c.provider_response,
         p.name AS product_name,p.image AS product_image,
         c.quantity,
         c.details_order_user,
         c.custom_requirement,
         c.status_pay,
         c.price AS cart_price,
         u.firstname AS customer_firstname,
         u.lastname AS customer_lastname,
         u.profile_image AS customer_profile_image,
         prov.provider_id,
         up.firstname AS provider_firstname,
         up.lastname AS provider_lastname
       FROM cart c
       JOIN products p ON c.product_id = p.product_id
       JOIN users u ON c.customer_id = u.user_id
       JOIN providers prov ON c.provider_id = prov.provider_id
       JOIN users up ON prov.user_id = up.user_id
       WHERE c.customer_id = $1
       ORDER BY c.created_at DESC`,
      [user_id]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching cart products:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
