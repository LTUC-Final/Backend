const express = require('express');
const router = express.Router();
const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.get('/getProductsByUser/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.product_id, p.provider_id, p.category_id, p.name, p.location, 
              p.description, p.price, p.image, p.created_at
       FROM products p
       JOIN providers pr ON p.provider_id = pr.provider_id
       WHERE pr.user_id = $1 AND p.isAvailable = TRUE`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No products found for this user' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user products:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;