const express = require('express');
const router = express.Router();

const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  //provider id to get all his reviews
router.get("/getProviderReviews/:id", async (req, res) => {
  const { id } = req.params;


  try {
    const result = await pool.query(
      `SELECT 
    rp.review_provider_id,
    rp.rating,
    rp.review_text,
    rp.created_at,

    c.user_id AS customer_id,
    c.firstname AS customer_firstname,
    c.lastname AS customer_lastname,

    p.provider_id,
    u.user_id AS provider_user_id,
    u.firstname AS provider_firstname,
    u.lastname AS provider_lastname,
    p.bio,
    p.skills

FROM reviews_provider rp
JOIN users c ON rp.customer_id = c.user_id    
JOIN providers p ON rp.provider_id = p.provider_id
JOIN users u ON p.user_id = u.user_id     
WHERE rp.provider_id = $1;`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `Provider's reviews  not found`});
    }

    res.json(result.rows);

  } catch (error) {
    console.log("error fetching Provider profile ", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
