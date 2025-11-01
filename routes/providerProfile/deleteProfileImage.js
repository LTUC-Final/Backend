const express = require('express');
const router = express.Router();

const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.delete('/deleteProfileImage/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE users
       SET profile_image = NULL
       WHERE user_id = $1
       RETURNING *;`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found or no image to delete' });
    }

    res.json({
      message: 'Profile image deleted successfully ✨',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error deleting profile image:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router; 