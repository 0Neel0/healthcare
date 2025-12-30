import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const testModel = async () => {
    try {
        console.log("Testing text-only prompt on gemini-1.5-flash...");

        if (!process.env.GEMINI_API_KEY) {
            console.error("API Key missing!");
            return;
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = "Hello, are you working?";

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("--- SUCCESS ---");
        console.log(text);

    } catch (error) {
        console.error("--- FAILURE ---");
        console.error("Error detailed:", JSON.stringify(error, null, 2));
    }
};

testModel();
