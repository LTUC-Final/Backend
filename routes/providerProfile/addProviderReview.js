const express = require('express');
const router = express.Router();

const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.post("/postReview/:providerId/:customer_id", async (req, res) => {
  const { providerId,customer_id } = req.params;
  const { rating, review_text } = req.body; //need update for test added customerId

  // const customer_id = req.user.user_id; // FROM AUTH

  try {
    const existing = await pool.query(
  "SELECT * FROM reviews_provider WHERE provider_id=$1 AND customer_id=$2",
  [providerId, customer_id]);
//avoid same user gave to provider more than one rating 
  if (existing.rows.length > 0) { 
  return res.status(400).json({ message: "You have already reviewed this provider" });
    }

    const result = await pool.query(
      `INSERT INTO reviews_provider (provider_id, customer_id, rating, review_text)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [providerId, customer_id, rating, review_text]
    );

    res.status(201).json({
      message: "Review added successfully",
      review: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding review" });
  }
});
module.exports = router;