require("dotenv").config();
const pg = require("pg");
const express = require("express");
const route = express.Router();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

route.get("/ReviewsProduct/:id", async (req, res) => {
  const id = req.params.id;

  try {

    const result = await pool.query(`
      SELECT 
        r.review_id,
        r.product_id,
        r.rating,
        r.review_text,
        r.created_at,
        u.role,
        u.user_id AS customer_id,
        u.firstname AS customer_name,        u.lastname AS CustomerLastName,

        u.profile_image AS customer_profile_image 
      FROM reviews r
      JOIN users u ON r.customer_id = u.user_id WHERE r.product_id=$1
    `, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error(
      "Error fetching  quiry  in getAllOrderProvider router:",
      error.message
    );
    let obj = {
      error: "somthing habpend  ",
    };
    res.status(500).json({
      error:
        "Something went wrong while fetching a quiry  in getAllOrderProvider router.",
    });
  }

});

module.exports = route;
