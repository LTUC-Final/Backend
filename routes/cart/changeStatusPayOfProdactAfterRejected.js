const express = require("express");
const pg = require("pg");
const cors = require("cors");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.put(
  "/changeStatusPayOfProdactAfterRejected/:cart_id",
  async (req, res) => {
    try {
      const cart_id = req.params.cart_id;
      const status = "rejected";
      console.log(cart_id);

      const result1 = await pool.query(
        `UPDATE orders
       SET status = $1
       WHERE cart_id = $2
       RETURNING *;`,
        [status, cart_id]
      );

      const result = await pool.query(
        `DELETE FROM cart
       WHERE cart_id = $1
       RETURNING *;`,
        [cart_id]
      );

      res.json(
        result.row
      );
    } catch (err) {
      console.error(
        "Error in changeStatusPayOfProdactAfterRejected:",
        err.message
      );
      res
        .status(500)
        .json({ message: "Error updating status or deleting cart" });
    }
  }
);
module.exports = router;