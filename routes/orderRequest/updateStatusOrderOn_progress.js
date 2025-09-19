const express = require("express");
const axios = require("axios");
const pg = require("pg");
const cors = require("cors");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.put("/updateStatusOrder/on_progress/:order_id", async (req, res) => {
  try {
    const order_id = req.params.order_id;
    console.log(order_id);
    const status = "on_progress";
    const response = await pool.query(
      `
  update  orders set  status=$1
      WHERE order_id = $2
      RETURNING *;

       `,
      [status, order_id]
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
