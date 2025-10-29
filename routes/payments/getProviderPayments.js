const express = require("express");
const pg = require("pg");
require("dotenv").config();

const router = express.Router();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.get("/provider/:provider_id", async (req, res) => {
  try {
    const provider_id = Number(req.params.provider_id);

    console.log("sssssssssssssssssssssssssssssssssssssssssssaaaaaaaaaaa");

    console.log(provider_id);
    console.log("sssssssssssssssssssssssssssssssssssssssssssaaaaaaaaaaa");

    const balanceRes = await pool.query(
      `SELECT total_balance FROM provider_balance WHERE provider_id = $1`,
      [provider_id]
    );
    const totalBalance = balanceRes.rows[0]?.total_balance || 0;
    const paymentsRes = await pool.query(
      `SELECT 
    sp.*,
    u.firstname,
    u.lastname,
    u.email,
    u.phone
  FROM stripe_payments AS sp
  JOIN users AS u
    ON sp.customer_id = u.user_id
  WHERE sp.provider_id = $1
  ORDER BY sp.payment_date DESC`,
      [provider_id]
    );

    console.log("sssssssssssssssssssssssssssssssssssssssssssaaaaaaaaaaa");

    console.log(paymentsRes.rows);
    console.log("sssssssssssssssssssssssssssssssssssssssssssaaaaaaaaaaa");

    res.json({
      total_balance: totalBalance,
      payments: paymentsRes.rows,
    });
  } catch (error) {
    console.error("Error fetching provider payments:", error);
    res.status(500).json({ error: "Failed to fetch provider payments" });
  }
});

module.exports = router;
