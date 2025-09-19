const express = require("express");
const pg = require("pg");
const cors = require("cors");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.post("/postItem", async (req, res) => {
  try {
    const {
      typeOfItem,
      name,
      image,
      description,
      category_id,
      provider_id,
      price,
      location,
    } = req.body;

    const response = await pool.query(
      `
  INSERT INTO products (provider_id,category_id,name,location,description,price,type_of_product,image
) VALUES (
    $1,$2,$3,$4,$5,$6,$7,$8
) RETURNING *;
       `,
      [
        provider_id,
        category_id,
        name,
        location,
        description,
        price,

        typeOfItem,
        image,
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
