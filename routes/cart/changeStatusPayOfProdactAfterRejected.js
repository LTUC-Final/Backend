// routes/cart/changeStatusPayOfProdactAfterRejected.js
// routes/cart/changeStatusPayOfProdactAfterRejected.js
const express = require("express");
const pg = require("pg");
require("dotenv").config();

const router = express.Router();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.put("/changeStatusPayOfProdactAfterRejected/:cart_id", async (req, res) => {
  try {
    const { cart_id } = req.params;

    const orderUpdate = await pool.query(
      `UPDATE orders
       SET status = 'rejected'
       WHERE cart_id = $1
       RETURNING *`,
      [cart_id]
    );

    if (orderUpdate.rows.length === 0) {
      return res.status(404).json({ message: "لم يتم العثور على الطلب لرفضه" });
    }

    const cartDelete = await pool.query(
      `DELETE FROM cart
       WHERE cart_id = $1
       RETURNING *`,
      [cart_id]
    );

    res.json({
      message: "❌ تم رفض الطلب",
      order: orderUpdate.rows[0],
      deletedCart: cartDelete.rows[0],
    });
  } catch (err) {
    console.error("Error in changeStatusPayOfProdactAfterRejected:", err.message);
    res.status(500).json({ message: "خطأ داخلي أثناء رفض الطلب", details: err.message });
  }
});


module.exports = router;
