const express = require("express");
const axios = require("axios");
const pg = require("pg");
const cors = require("cors");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
//  this route to provider when write the details about custom  order and change the price and change the status to awaiting_approval
router.put("/updatePriceOrderAndDetails/:order_id", async (req, res) => {
  try {
    const { price, details } = req.body;
    console.log(req.body);

    const order_id = req.params.order_id;
    console.log(order_id);
    const status = "awaiting_approval";
    const response = await pool.query(
      `
  update  orders set  
  original_price=$1,
  response_from_provider=$2,status=$3


      WHERE order_id = $4
      RETURNING *;

       `,
      [price, details, status, order_id]
    );

    res.json(response.rows[0]);
  } catch (error) {
    console.error("Error fetching  quiry :", error.message);
    let obj = {
      error: "somthing habpend  ",
    };
    res.status(500).json({
      error: "Something went wrong while fetching a quiry.",
    });
  }
});
module.exports = router;
