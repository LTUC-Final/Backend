const express = require("express");
const pg = require("pg");
const cors = require("cors");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.put("/changeStatusPayOfProdactAfterApprove", async (req, res) => {
  try {
    const { cart_id, user_id } = req.body;

    const result = await pool.query(
      `UPDATE cart set 
       status_pay = 'Approve' 
       WHERE cart_id = $1 AND customer_id = $2
       RETURNING *`,
      [cart_id, user_id]
    );

    const result1 = await pool.query(
      `DELETE FROM orders
       WHERE cart_id = $1
       RETURNING *;`,
      [cart_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error in addCustomRequirement:", err.message);
    res.status(500).json({ message: "Error adding custom requirement" });
  }
});
module.exports = router;
