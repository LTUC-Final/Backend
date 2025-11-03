//routes/carts/addCustomRequirement.js
const express = require("express");
const pg = require("pg");
const cors = require("cors");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.put("/sendResponseProviderToCart", async (req, res) => {
  try {
    const { cart_id, response_from_provider, price } = req.body;
    console.log(cart_id + response_from_provider + price);
    const result = await pool.query(
      `UPDATE cart 
set  provider_response=$2,price=$3
       WHERE cart_id = $1 
       RETURNING *`,
      [cart_id, response_from_provider, price]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error in addCustomRequirement:", err.message);
    res.status(500).json({ message: "Error adding custom requirement" });
  }
});
module.exports = router;
