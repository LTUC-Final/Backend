const express = require("express");
const pg = require("pg");
const cors = require("cors");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.delete("/deleteCard/:cart_id", async (req, res) => {
  try {
    const { cart_id } = req.params;

    await pool.query(
      `DELETE FROM cart 
       WHERE cart_id = $1`,
      [cart_id]
    );

    res.json({ message: "Cart item rejected and removed" });
  } catch (err) {
    console.error("Error in customer reject:", err.message);
    res.status(500).json({ message: "Error rejecting custom requirement" });
  }
});module.exports = router;
