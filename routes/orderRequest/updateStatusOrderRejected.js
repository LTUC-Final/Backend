const express = require("express");
const axios = require("axios");
const pg = require("pg");
const cors = require("cors");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
router.put(
  "/updateStatusOrder/rejected/:order_id/:cart_id",
  async (req, res) => {
    try {
      const order_id = req.params.order_id;
      const cart_id = req.params.cart_id;

      console.log(order_id);
      const status = "rejected";
      const response = await pool.query(
        `
  update  orders set  status=$1
      WHERE order_id = $2
      RETURNING *;

       `,
        [status, order_id]
      );
      //     const response1 = await pool.query(
      //       `
      //   UPDATE cart
      //   SET provider_response = $1
      //   WHERE cart_id = $2
      //   RETURNING *;
      // `,
      //       ["I'm sorry, but I can't do this order.", cart_id]
      //     );

      const response1 = await pool.query(`delete from cart where cart_id=$1;`, [
        cart_id,
      ]);
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
  }
);

module.exports = router;
