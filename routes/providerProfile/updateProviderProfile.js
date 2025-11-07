const express = require("express");
const multer = require("multer");
const router = express.Router();
const path = require("path");
const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const { bucket } = require("../../firebaseConfig");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
// const upload = multer({ storage });
const upload = multer({ storage: multer.memoryStorage() });

router.put(
  "/updateProviderProfile/:id",
  upload.single("profile_image"),
  async (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, email, phone, bio, skills } = req.body;
    // const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      const oldUser = await pool.query(
        "SELECT profile_image FROM users WHERE user_id = $1",
        [id]
      );
      let imageUrl = oldUser.rows[0]?.profile_image || null;

      if (req.file) {
        if (imageUrl && imageUrl.includes("firebasestorage.googleapis.com")) {
          try {
            const startIndex = imageUrl.indexOf("/o/") + 3;
            const endIndex = imageUrl.indexOf("?alt");
            const oldFileName = decodeURIComponent(
              imageUrl.substring(startIndex, endIndex)
            );

            await bucket.file(oldFileName).delete();
            console.log(" Old profile image deleted:", oldFileName);
          } catch (err) {
            console.warn(" Could not delete old image:", err.message);
          }
        }

        const file = req.file;
        const fileName = `profile/${Date.now()}_${file.originalname}`;
        const blob = bucket.file(fileName);

        const blobStream = blob.createWriteStream({
          metadata: { contentType: file.mimetype },
        });

        await new Promise((resolve, reject) => {
          blobStream.on("error", reject);
          blobStream.on("finish", resolve);
          blobStream.end(file.buffer);
        });

        const token = crypto.randomUUID();
        await blob.setMetadata({
          metadata: { firebaseStorageDownloadTokens: token },
        });

        imageUrl = `https://firebasestorage.googleapis.com/v0/b/${
          bucket.name
        }/o/${encodeURIComponent(blob.name)}?alt=media&token=${token}`;
      }

      const userUpdate = await pool.query(
        `UPDATE users
       SET firstname = COALESCE($1, firstname),
           lastname = COALESCE($2, lastname),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           profile_image = COALESCE($5, profile_image)
       WHERE user_id = $6
       RETURNING user_id, firstname, lastname, email, phone, profile_image;`,

        [firstname, lastname, email, phone, imageUrl, id]
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
