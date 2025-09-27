const express = require('express');
const router = express.Router();

const multer = require("multer");
const path = require("path");

const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

router.patch('/updateProduct/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const fields = { ...req.body };

  if (req.file) {
    fields.image = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
;
  }
  const keys = Object.keys(fields);
  const values = Object.values(fields);

  if (keys.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  const setString = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

  try {
    const result = await pool.query(
      `UPDATE products SET ${setString} WHERE product_id = $${keys.length + 1} RETURNING *;`,
      [...values, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

// router.patch('/updateProduct/:id', upload.single("image"),async (req, res) => {
//   const { id } = req.params; 
//   const fields = req.body;     

//   const keys = Object.keys(fields);
//   const values = Object.values(fields);

//   const setString = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");

//   try {
  
//     const result = await pool.query(
//       `UPDATE products SET ${setString} WHERE product_id = $${keys.length + 1} RETURNING *;`,
//       [...values, id]
//     );
//     const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

//     if (result.rowCount === 0) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     res.json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

