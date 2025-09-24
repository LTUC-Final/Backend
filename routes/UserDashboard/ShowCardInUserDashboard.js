require("dotenv").config();
const pg = require("pg");
const express = require("express");
const route = express.Router();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

route.get("/ShowCardInUserDashboard", async (req, res) => {

  try {

    const card = await pool.query(`SELECT s.product_id , p.provider_id, u.role ,u.firstname , u.lastname, s.category_id , s.name , s.location , s.price , s.image , g.name AS category_name,
    g.description AS category_description
      FROM products s 
      JOIN providers p ON p.provider_id = s.provider_id 
      JOIN categories g ON g.category_id = s.category_id
      JOIN users u ON u.user_id = p.user_id WHERE isAvailable = TRUE`)

    if (card.rows.length === 0) {
      return res.status(404).json({ error: "No products found" });
    }

    res.json(card.rows);
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
        "Something went wrong while fetching a quiry.",
    });
  }


})
module.exports = route;