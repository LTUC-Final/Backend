const express = require("express");
const pg = require("pg");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

router.post("/postItem", upload.single("image"), async (req, res) => {
  try {
    const {
      type,
      name,
      // image,
      description,
      category_id,
      provider_id,
      price,
      location,
    } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    console.log(req.body);
    const response = await pool.query(
      `
  INSERT INTO products (provider_id,category_id,name,location,description,price,type_of_product,image
) VALUES (
    $1,$2,$3,$4,$5,$6,$7,$8
) RETURNING *;
       `,
      [
        Number(provider_id),
    Number (category_id),
        name,
        location,
        description,
        price,

        type,
        imagePath,
      ]
    );
    res.json(response.rows[0]);
  } catch (error) {
    console.error("Error fetching  quiry :", error.message);
    let obj = {
      error: "somthing habpend  ",
    };
    res.status(500).json({
      error: "Something went wrong while fetching a quiry.",
    });
  }
});
module.exports = router;
