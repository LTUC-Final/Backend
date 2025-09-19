const express = require("express");
const router = express.Router();

router.post("/logout", async (_req, res) => {
  res.json({ message: "Logged out" });
});

module.exports = router;
