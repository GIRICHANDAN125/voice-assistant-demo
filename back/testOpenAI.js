import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY

});

async function run() {
  try {
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Say hi" }]
    });

    console.log("OPENAI RESPONSE:", res.choices[0].message.content);
  } catch (err) {
    console.error("OPENAI ERROR:", err);
  }
}

run();
