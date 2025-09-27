const express = require('express');
const router = express.Router();
<<<<<<< Updated upstream
const multer = require('multer');
const path = require('path');
=======
const multer = require("multer");
const path = require("path");

>>>>>>> Stashed changes
const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const storage = multer.diskStorage({
<<<<<<< Updated upstream
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
=======
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
>>>>>>> Stashed changes
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

<<<<<<< Updated upstream

router.patch('/updateProduct/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const fields = { ...req.body };

  if (req.file) {
    fields.image = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
;
=======
router.patch('/updateProduct/:id', upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  // If an image is uploaded, add it to the fields
  if (req.file) {
    fields.image = `/uploads/${req.file.filename}`;
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
module.exports = router;
=======
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
module.exports = router;
>>>>>>> Stashed changes
