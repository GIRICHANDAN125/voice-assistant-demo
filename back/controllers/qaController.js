import Groq from "groq-sdk";

export const answerQuestion = async (req, res) => {
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const { question } = req.body;
    if (!question) {
      return res.json({ answer: "Please say something" });
    }

    const chat = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a helpful voice assistant." },
        { role: "user", content: question }
      ]
    });

    res.json({
      answer: chat.choices[0].message.content
    });
  } catch (err) {
    console.error(err);
    res.json({ answer: "Sorry, something went wrong." });
  }
};
