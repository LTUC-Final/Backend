const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
require("dotenv").config();

const router = express.Router();
router.use(cors());
router.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

router.post("/ai", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "No text provided" });
    }

    const messages = [
      {
        role: "system",
        content:
          "You are a helpful assistant. Provide **3 alternative ways** to rewrite the user's input, keeping the meaning but making it clearer and more professional. Format each suggestion as a numbered list.",
      },
      { role: "user", content: text },
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
    });

    const suggestion = completion.choices[0].message.content;
    console.log("AI suggestion:", suggestion);

    res.json({ suggestion }); 
  } catch (error) {
    console.error("Error in AI route:", error);
    res.status(500).json({ message: "Error generating suggestion" });
  }
});

module.exports = router;
