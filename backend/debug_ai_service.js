import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const summarizeDocument = async (filePath, mimeType) => {
    try {
        console.log(`Testing with file: ${filePath}`);
        console.log(`MimeType: ${mimeType}`);

        if (!process.env.GEMINI_API_KEY) {
            console.error("API Key missing!");
            return;
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const fileBuffer = fs.readFileSync(filePath);
        const base64Data = fileBuffer.toString("base64");
        console.log(`File read. Size: ${fileBuffer.length} bytes`);

        const prompt = "Analyze this medical report and provide a concise summary for the patient.";

        const imageParts = [
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType,
                },
            },
        ];

        console.log("Sending to Gemini...");
        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();
        console.log("--- SUCCESS ---");
        console.log(text.substring(0, 200) + "...");
        return text;

    } catch (error) {
        console.error("--- FAILURE ---");
        console.error("Error generating summary detailed:", JSON.stringify(error, null, 2));
        if (error.response) {
            // error.response.text() returns a promise
            const responseText = await error.response.text().catch(e => "Could not read response text");
            console.error("Gemini API Error Response:", responseText);
        }
    }
};

// Pick a file from the list I found
const testFile = "uploads/1766986493998-417703632.pdf";
const fullPath = path.resolve(testFile);

summarizeDocument(fullPath, "application/pdf");
