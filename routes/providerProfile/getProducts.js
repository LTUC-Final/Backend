const express = require('express');
const router = express.Router();
const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.get('/getProviderProducts/:provider_id', async (req, res) => {
  const { provider_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT   product_id,provider_id, category_id, name, location, description, price, image,created_at
       FROM products
       WHERE provider_id = $1`,
      [provider_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No products found for this provider' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching provider products:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
