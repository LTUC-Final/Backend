require("dotenv").config();
const pg = require("pg");
const express = require("express");
const route = express.Router();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
route.post("/api/product/reaction", async (req, res) => {
  const { userId, type, product_id } = req.body;

  try {
    const { rows } = await pool.query(
      `SELECT reactions FROM products WHERE product_id = $1`,
      [product_id]
    );

    let reactions = rows[0]?.reactions || {};
    let selectedReaction = null;
    let removed = false;

    if (reactions[type]?.includes(userId)) {
      reactions[type] = reactions[type].filter((id) => id !== userId);
      removed = true; 
    } else {
      for (const key in reactions) {
        reactions[key] = reactions[key].filter((id) => id !== userId);
      }
      if (!reactions[type]) reactions[type] = [];
      reactions[type].push(userId);
      selectedReaction = type;
    }

    const updated = await pool.query(
      `UPDATE products SET reactions = $1 WHERE product_id = $2 RETURNING *`,
      [reactions, product_id]
    );

  
    const reactionCounts = {};
    for (const key in reactions) {
      reactionCounts[key] = reactions[key].length;
      if (reactions[key].includes(userId)) {
        selectedReaction = key;
      }
    }

    res.json({
      reactions: updated.rows[0].reactions,
      reactionCounts,
      selectedReaction: removed ? null : selectedReaction, // إذا مسح -> null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = route;
