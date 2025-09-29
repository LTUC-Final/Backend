
const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require("path");
const pg = require("pg");
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
const upload = multer({ storage });


router.put(
  "/updateProviderProfile/:id",
  upload.single("profile_image"),
  async (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, email, phone, bio, skills } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      const userUpdate = await pool.query(
        `UPDATE users
       SET firstname = COALESCE($1, firstname),
           lastname = COALESCE($2, lastname),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           profile_image = COALESCE($5, profile_image)
       WHERE user_id = $6
       RETURNING user_id, firstname, lastname, email, phone, profile_image;`,

        [firstname, lastname, email, phone, imagePath, id]
      );


      const providerUpdate = await pool.query(
        `UPDATE providers
       SET bio = COALESCE($1, bio),
           skills = COALESCE($2, skills)
       WHERE user_id = $3
       RETURNING bio, skills;`,
        [bio, skills, id]
      );

      const updatedProfile = {
        ...userUpdate.rows[0],
        ...providerUpdate.rows[0],
      };

      res.json({
        message: "Provider profile updated",
        updated: updatedProfile,
      });
      console.log("Provider profile updated", updatedProfile);
    } catch (error) {
      console.log("Error updating provider profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;

