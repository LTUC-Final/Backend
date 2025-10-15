const express = require("express");
const axios = require("axios");
const pg = require("pg");
const cors = require("cors");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
router.get("/getUserReactions/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const query = `
      SELECT 
        p.product_id ,
        p.name AS product_name,
        p.description,
        p.image,
        pr.provider_id,
        u.user_id,
        u.firstname,
        u.lastname,
        u.profile_image,
        pr.bio,
        pr.skills,
        CASE
          WHEN p.reactions->'love' @> to_jsonb(ARRAY[$1::int]) THEN 'love'
          WHEN p.reactions->'proud' @> to_jsonb(ARRAY[$1::int]) THEN 'proud'
          WHEN p.reactions->'support' @> to_jsonb(ARRAY[$1::int]) THEN 'support'
        END AS reaction_type
      FROM products p
      JOIN providers pr ON p.provider_id = pr.provider_id
      JOIN users u ON pr.user_id = u.user_id
      WHERE
        (p.reactions->'love' @> to_jsonb(ARRAY[$1::int]))
        OR (p.reactions->'proud' @> to_jsonb(ARRAY[$1::int]))
        OR (p.reactions->'support' @> to_jsonb(ARRAY[$1::int]));
    `;

    const { rows } = await pool.query(query, [user_id]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching user reactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
