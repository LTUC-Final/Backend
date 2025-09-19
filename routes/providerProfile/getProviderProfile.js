const express = require('express');
const router = express.Router();
const pg = require('pg');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.get("/getProviderProfile/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
         providers.provider_id,
         users.user_id AS provider_user_id,
         users.firstname,
         users.lastname,
         users.email,
         users.phone,
         users.profile_image,
         providers.bio,
         providers.skills,
         users.created_at
       FROM providers
       JOIN users ON providers.user_id = users.user_id
       WHERE providers.provider_id = $1;`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    res.json(result.rows[0]); 
  } catch (error) {
    console.error("Error fetching provider profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
