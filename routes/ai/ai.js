const express = require("express");
const axios = require("axios");
const cors = require("cors");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const OpenAI = require("openai");
const OPEN_AI_KEY = process.env.OPEN_AI_KEY;

async function getDataFromDB() {
  const result = await pool.query("SELECT status, amount FROM orders");
  return result.rows;
}

router.post("/ai", async (req, res) => {
  console.log("aiiiiiiiiiiiiiiiiiiiiiii");
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

router.post("/ai2", async (req, res) => {
  const { input } = req.body;
  console.log(input);
  try {
    const openai = new OpenAI({
      apiKey: OPEN_AI_KEY,
    });
    const formattedInput = `
      حلل هذه البيانات وأعطني مجموع كل حالة (status) وعددها:
      ${JSON.stringify(input, null, 2)}
      رجاءً أعد النتائج في JSON مثل:
      {
        "pending": { "count": 3, "total": 120 },
        "completed": { "count": 5, "total": 250 }
      }
    `;
    const response = await openai.responses.create({
      model: "gpt-5-nano",
      input: formattedInput,
      store: true,
    });
    const reply =
      response.output_text ||
      response.output?.[0]?.content?.[0]?.text ||
      "No reply generated";

    let jsonResult;
    try {
      jsonResult = JSON.parse(reply);
    } catch {
      jsonResult = { error: "OpenAI reply is not valid JSON", raw: reply };
    }

    res.json({ result: jsonResult });

    // response.then((result) => console.log(result.output_text));

    // const client = new OpenAI({
    //   apiKey: OPEN_AI_KEY,
    //   // dangerouslyAllowBrowser: true,
    // });

    // const completion = await client.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   //   model: 'gpt-3.5-turbo',
    //   messages,
    //   temperature: 0.7,
    // });

    // console.log(completion.choices[0].message.content);

    // res.json(completion.choices[0].message.content);
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
