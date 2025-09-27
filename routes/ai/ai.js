const express = require("express");
const axios = require("axios");
const cors = require("cors");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const OpenAI = require("openai");
const OPEN_AI_KEY = process.env.OPEN_AI_KEY;

router.post("/ai", async (req, res) => {
  const messages = req.body;
  try {
    const client = new OpenAI({
      apiKey: OPEN_AI_KEY,
      // dangerouslyAllowBrowser: true,
    });

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      //   model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
    });

    console.log(completion.choices[0].message.content);

    res.json(completion.choices[0].message.content);
  } catch (error) {
    console.error("Error adding owner:", error);
    res.status(500).json({ message: "Error adding owner" });
  }
});
module.exports = router;

// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: OPEN_AI_KEY,
// });

// const response = openai.responses.create({
//   model: "gpt-5-nano",
//   input: "write a haiku about ai",
//   store: true,
// });

// response.then((result) => console.log(result.output_text));
