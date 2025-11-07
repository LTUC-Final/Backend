//routes/carts/addCustomRequirement.js
const express = require("express");
const pg = require("pg");
const cors = require("cors");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.put("/updateTheCustomReqAndToOrder", async (req, res) => {
  try {
    const {
      cart_id,
      user_id,
      custom_requirement,
      price,
      Prodact_id,

      provider_id,
      quntity,
    } = req.body;

    console.log(
      cart_id,
      user_id,
      custom_requirement,
      price,
      Prodact_id,

      provider_id,
      quntity
    );
    const result = await pool.query(
      `UPDATE cart 
   SET custom_requirement = $1,
       sendedtoprovider = TRUE,
       status_pay = 'Unapprove', quantity=$4
   WHERE cart_id = $2 AND customer_id = $3
   RETURNING *`,
      [custom_requirement, cart_id, user_id, quntity]
    );

    const status = "awaiting_approval";
    const result1 = await pool.query(
      `INSERT INTO orders  
    (details_order_user, original_price, provider_id, product_id, quantity, customer_id,status,  cart_id
) 
   VALUES ($1, $2, $3, $4, $5, $6,$7,$8)
   RETURNING *;`,
      [
        custom_requirement,
        price,
        provider_id,
        Prodact_id,
        quntity,
        user_id,
        status,
        cart_id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error in addCustomRequirement:", err.message);
    res.status(500).json({ message: "Error adding custom requirement" });
  }
});

//order

module.exports = router;
