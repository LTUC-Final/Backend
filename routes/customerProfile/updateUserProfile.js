const express = require('express');
const router = express.Router();
const pg = require('pg');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.put('/updateUserProfile/:id', async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, phone, profile_image, email } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users 
       SET firstname = $1, lastname = $2, phone = $3, profile_image = $4, email = $5
       WHERE user_id = $6
       RETURNING user_id, firstname, lastname, phone, profile_image, email;`,
      [firstname, lastname, phone, profile_image, email, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile details updated successfully", updated: result.rows[0] });
  } catch (error) {
    console.error("Error updating user profile:", error.message);
    res.status(500).send("Error updating user profile");
  }
});

module.exports = router;
