const express = require('express');
const router = express.Router();
const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.put("/updateProviderProfile/:id", async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, phone, profile_image, bio, skills } = req.body;

  try {
    const userUpdate = await pool.query(
      `UPDATE users
       SET firstname = COALESCE($1, firstname),
           lastname = COALESCE($2, lastname),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           profile_image = COALESCE($5, profile_image)
       WHERE user_id = $6
       RETURNING user_id, firstname, lastname, email, phone, profile_image;`,
      [firstname, lastname, email, phone, profile_image, id]
    );

    const providerUpdate = await pool.query(
      `UPDATE providers
       SET bio = COALESCE($1, bio),
           skills = COALESCE($2, skills)
       WHERE user_id = $3
       RETURNING bio, skills;`,
      [bio, skills, id]
    );

    const updatedProfile = {
      ...userUpdate.rows[0],
      ...providerUpdate.rows[0]
    };

    res.json({ message: "Provider profile updated", updated: updatedProfile });
    console.log("Provider profile updated",updatedProfile);
    
  } catch (error) {
    console.log("Error updating provider profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
