const express = require('express');
const router = express.Router();
const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

 // this path will hide product  where isAvailable = FALSE not delete it from dp 
router.delete('/deleteProduct/:provider_id/:product_id', async (req, res) => {
  const { product_id, provider_id } = req.params;
    console.log('product_id:', product_id, 'provider_id:', provider_id);

  try {
    const result = await pool.query(
      `UPDATE products
       set isAvailable = FALSE
       WHERE product_id = $1 AND provider_id = $2 
       RETURNING *;`,
      [product_id, provider_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'No product found for this provider with this ID' });
    }

    res.json({ message: 'Product deleted successfully', deletedProduct: result.rows[0] });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
