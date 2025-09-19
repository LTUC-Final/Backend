const express = require('express');
const router = express.Router();

const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
router.patch('/updateProduct/:id', async (req, res) => {
  const { id } = req.params; 
  const fields = req.body;     

  const keys = Object.keys(fields);
  const values = Object.values(fields);

  const setString = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");

  try {
  
    const result = await pool.query(
      `UPDATE products SET ${setString} WHERE product_id = $${keys.length + 1} RETURNING *;`,
      [...values, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;