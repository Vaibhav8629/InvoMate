const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

async function askGemini(prompt) {
  try {

    console.log("\nPROMPT SENT TO GEMINI:\n");
    console.log(prompt);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const result = await model.generateContent(prompt);

    const text = result.response.text();

    console.log("\nGEMINI RESPONSE:\n");
    console.log(text);

    return text;

  } catch (err) {

    console.error("Gemini Error:", err);
    throw err;

  }
}

module.exports = askGemini;