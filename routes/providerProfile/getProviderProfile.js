const express = require('express');
const router = express.Router();
const pg = require('pg');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.get("/getProviderProfile/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT      
      users.user_id ,
         providers.provider_id AS provider_user_id,
         users.firstname,
         users.lastname,
         users.email,
         users.phone,
         users.profile_image,
         users.role,
         providers.bio,
         providers.skills,
         users.created_at
       FROM providers
       RIGHT JOIN users ON providers.user_id = users.user_id
       WHERE users.user_id = $1;`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    res.json(result.rows[0]); 
    console.log("result",result.rows[0]);
    
  } catch (error) {
    console.error("Error fetching provider profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;

// router.get("/getProviderProfile/:user_id", async (req, res) => {
//   const { user_id } = req.params;

//   try {
//     const result = await pool.query(
//       `SELECT 
//          providers.provider_id,
//          users.user_id AS provider_user_id,
//          users.firstname,
//          users.lastname,
//          users.email,
//          users.phone,
//          users.profile_image,
//          providers.bio,
//          providers.skills,
//          users.created_at
//        FROM providers
//        JOIN users ON providers.user_id = users.user_id
//        WHERE users.user_id = $1;`, 
//       [user_id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Provider profile not found" });
//     }

//     res.json(result.rows[0]); 
//   } catch (error) {
//     console.error("Error fetching provider profile:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });
