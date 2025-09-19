const express = require("express");
const pg = require("pg");
const cors = require("cors");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.post("/addProviderInfo/bio/:user_id", async (req, res) => {
  try {
    const { bio } = req.body;
    const user_id = req.params.user_id;

    const response = await pool.query(
      `
  update  providers set  bio=$1
      WHERE user_id  = $2
      RETURNING *;`,
      [bio, user_id]
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

router.post("/addProviderInfo/skills/:user_id", async (req, res) => {
  try {
    const { bio, skills } = req.body;
    const user_id = req.params.user_id;

    const response = await pool.query(
      `
  update  providers set  skills=$1
      WHERE user_id  = $2
      RETURNING *;

       `,
      [skills, user_id]
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

router.put("/updateBio/:user_id", async (req, res) => {
  try {
    const { bio } = req.body;
    const user_id = req.params.user_id;

    const response = await pool.query(
      `UPDATE providers SET bio = $1 WHERE user_id = $2 RETURNING *;`,
      [bio, user_id]
    );

    if (response.rows.length === 0)
      return res.status(404).json({ error: "Provider not found." });

    res.json(response.rows[0]);
  } catch (error) {
    console.error("Error updating bio:", error.message);
    res.status(500).json({ error: "Something went wrong while updating bio." });
  }
});
router.put("/updateSkills/:user_id", async (req, res) => {
  try {
    const { skills } = req.body;
    const user_id = req.params.user_id;

    const response = await pool.query(
      `UPDATE providers SET skills = $1 WHERE user_id = $2 RETURNING *;`,
      [skills, user_id]
    );

    if (response.rows.length === 0)
      return res.status(404).json({ error: "Provider not found." });

    res.json(response.rows[0]);
  } catch (error) {
    console.error("Error updating skills:", error.message);
    res
      .status(500)
      .json({ error: "Something went wrong while updating skills." });
  }
});

module.exports = router;
