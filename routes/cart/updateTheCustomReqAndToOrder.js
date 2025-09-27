//routes/carts/updateTheCustomReqAndToOrder     ديد بعد ما    // ارسال الموفر functios 
// routes/cart/updateTheCustomReqAndToOrder.js
const express = require("express");
const pg = require("pg");
require("dotenv").config();

const router = express.Router();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.put("/updateTheCustomReqAndToOrder", async (req, res) => {
  try {
    const {
      cart_id,
      user_id,
      custom_requirement,
      price,
      product_id,
      provider_id,
      quantity,
    } = req.body;

    if (!cart_id || !user_id || !product_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // تحديث cart → الطلب صار Unapprove
   await pool.query(
  `UPDATE cart
   SET custom_requirement = $1,  
       status_pay = 'Unapprove'
   WHERE cart_id = $2 AND customer_id = $3`,
  [custom_requirement, cart_id, user_id]
);

 
   // إدخال الطلب في orders مع cart_id
const result = await pool.query(
  `INSERT INTO orders
   (customer_id, provider_id, product_id, quantity, original_price, details_order_user, status, cart_id)
   VALUES ($1,$2,$3,$4,$5,$6,'awaiting_approval',$7)
   RETURNING *`,
  [user_id, provider_id, product_id, quantity, price, custom_requirement, cart_id]
);

    res.json({ message: "تم إرسال الطلب المخصص للموفر", order: result.rows[0] });
  } catch (err) {
    console.error("❌ Error in updateTheCustomReqAndToOrder:", err.message);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

module.exports = router;
