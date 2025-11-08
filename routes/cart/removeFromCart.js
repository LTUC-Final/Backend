//routes/removeFromCart.js
const express = require("express");
const pg = require("pg");
const cors = require("cors");
 
require("dotenv").config();
const router = express.Router();
router.use(cors());
app.use(cors({
  origin: "https://your-frontend.onrender.com", // change to your frontend domain
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });


router.delete("/", async (req, res) => {
  try {
    const { cart_id, user_id } = req.body;
    const result = await pool.query(
      "DELETE FROM cart WHERE cart_id=$1 AND customer_id=$2 RETURNING *",
      [cart_id, user_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item removed", item: result.rows[0] });
  } catch (err) {
    console.error(" Error in removeFromCart:", err.message);
    res.status(500).json({ message: "Error removing item" });
  }
}    

);

module.exports = router;