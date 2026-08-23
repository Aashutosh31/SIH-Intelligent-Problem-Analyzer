import "dotenv/config";
import { generateGeminiContent } from "./geminiProvider.js";

const run = async () => {
  try {
    const response = await generateGeminiContent({
      prompt:
        "In one sentence, explain what Smart India Hackathon is.",
    });

    console.log("✅ Gemini API connection successful.");
    console.log("Response:");
    console.log(response.text);
  } catch (error) {
    console.error("❌ Gemini API test failed.");
    console.error(error.message);
    process.exitCode = 1;
  }
};

run();