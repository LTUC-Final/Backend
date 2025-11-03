const express= require('express');
const router= express.Router();

const pg = require('pg');
const pool = new pg.Pool({connectionString: process.env.DATABASE_URL});

router.get("/getUserProfile/:id",async (req, res) => {
 const { id } = req.params;

  try {
    const result = await pool.query(
      " SELECT user_id, firstname,lastname, email, phone, profile_image,   created_at FROM users WHERE user_id = $1",
      [id]
    ); 
   if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.log("error fetching user profile ", error);

    res.status(500).json({ message: "Server error" });
  }
});

module.exports=router;
const express= require('express');
const router= express.Router();

const pg = require('pg');
const pool = new pg.Pool({connectionString: process.env.DATABASE_URL});

router.get("/getUserProfile/:id",async (req, res) => {
 const { id } = req.params;

  try {
    const result = await pool.query(
      " SELECT user_id, firstname,lastname, email, phone, profile_image,   created_at FROM users WHERE user_id = $1",
      [id]
    ); 
   if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.log("error fetching user profile ", error);

    res.status(500).json({ message: "Server error" });
  }
});

module.exports=router;