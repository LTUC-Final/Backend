require("dotenv").config();
const pg = require("pg");
const express = require("express");
const route = express.Router();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

route.get("/ShowCardInUserDashboard/:user_id", async (req, res) => {
  const user_id = parseInt(req.params.user_id);
  console.log(user_id);

  try {
    const cardResult = await pool.query(`
      SELECT 
        s.product_id,
        p.provider_id,
        u.role,
        u.firstname,
        u.lastname,
        s.category_id,
        s.name,
        s.location,
        s.price,
        s.image,
        g.name AS category_name,
        g.description AS category_description,
        s.reactions,
        (
          SELECT jsonb_object_agg(key, jsonb_array_length(value))
          FROM jsonb_each(s.reactions)
        ) AS reaction_counts
      FROM products s
      JOIN providers p ON p.provider_id = s.provider_id
      JOIN categories g ON g.category_id = s.category_id
      JOIN users u ON u.user_id = p.user_id
      WHERE s.isAvailable = TRUE
    `);

    if (cardResult.rows.length === 0) {
      return res.status(404).json({ error: "No products found" });
    }
    const cardsWithReaction = cardResult.rows.map((card) => {
      const reactions = card.reactions || {};
      let selectedReaction = null;

      for (const type in reactions) {
        if (reactions[type]?.includes(user_id)) {
          selectedReaction = type;
          break;
        }
      }

      return {
        ...card,
        selectedReaction,
      };
    });

    
    res.json(cardsWithReaction);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({
      error: "Something went wrong while fetching products.",
    });
  }
});

module.exports = route;
