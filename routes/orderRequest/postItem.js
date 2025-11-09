const express = require("express");
const pg = require("pg");
const cors = require("cors");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const { bucket } = require("../../firebaseConfig");
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
// const upload = multer({ storage });
const upload = multer({ storage: multer.memoryStorage() });

router.post("/postItem", upload.single("image"), async (req, res) => {
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);
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
    // const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    let imageUrl = null;
    
console.log("this is data for req postItem",req.file)
console.log("ASdasdasd");

if (!req.file) {
  console.error("No file uploaded — req.file is undefined!");
  return res.status(400).json({ error: "Image file is required." });
}

    if (req.file) {
      const file = req.file;
      // const fileName = `${Date.now()}_${file.originalname}`;
      const fileName = `product/${Date.now()}_${file.originalname}`;

      const blob = bucket.file(fileName);
      const blobStream = blob.createWriteStream({
        metadata: { contentType: file.mimetype },
      });

      await new Promise((resolve, reject) => {
        blobStream.on("error", reject);
        blobStream.on("finish", resolve);
        blobStream.end(file.buffer);
      });

      // imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      // imageUrl = `https://storage.googleapis.com/job-tracker-b9e24.appspot.com/${blob.name}`;
      // imageUrl = `https://firebasestorage.googleapis.com/v0/b/${
      //   bucket.name
      // }/o/${encodeURIComponent(blob.name)}?alt=media`;

      const token = crypto.randomUUID();

      await blob.setMetadata({
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      });

      imageUrl = `https://firebasestorage.googleapis.com/v0/b/${
        bucket.name
      }/o/${encodeURIComponent(blob.name)}?alt=media&token=${token}`;
    }
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
        Number(category_id),
        name,
        location,
        description,
        price,

        type,
        // imagePath,
        imageUrl,
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
