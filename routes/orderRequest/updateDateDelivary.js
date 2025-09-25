const express = require("express");
const axios = require("axios");
const pg = require("pg");
const cors = require("cors");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
router.put("/delivary/:selectedDate/:order_id", async (req, res) => {
  try {
    const order_id = req.params.order_id;
    const selectedDate = req.params.selectedDate;
    console.log(order_id);

    const response = await pool.query(
      `
  update  orders set  datedelivery=$1
      WHERE order_id = $2
      RETURNING *;
       `,
      [selectedDate, order_id]
    );
    console.log("rejecteddddddddddd");
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
