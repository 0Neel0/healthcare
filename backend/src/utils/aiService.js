import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Summarizes a medical document using Gemini.
 * @param {string} filePath - Path to the file on disk.
 * @param {string} mimeType - MIME type of the file.
 * @returns {Promise<string>} - The summary text.
 */
// Fix for pdf-parse import in ESM
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

export const summarizeDocument = async (filePath, mimeType) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const fileBuffer = fs.readFileSync(filePath);

        let parts = [];
        let prompt = "Analyze this medical report and provide a concise summary for the patient. Include key findings, any abnormal results, and doctor's recommendations if present. Keep it simple and easy to understand.";

        // --- PDF Text Extraction Fallback ---
        // Native PDF support can be flaky or size-dependent. Extracting text is often more reliable for reports.
        if (mimeType === 'application/pdf') {
            try {
                const pdfData = await pdf(fileBuffer);
                const textContent = pdfData.text;
                // Truncate if too long (Gemini 1.5 has large context, but let's be safe)
                const safeText = textContent.slice(0, 30000);
                parts = [
                    prompt + "\n\nDocument Content:\n" + safeText
                ];
                // Use generateContent with string only
            } catch (pdfError) {
                console.warn("PDF text extraction failed, trying native image/pdf support:", pdfError);
                // Fallback to native
                const base64Data = fileBuffer.toString("base64");
                parts = [prompt, {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType,
                    },
                }];
            }
        } else {
            // Images
            const base64Data = fileBuffer.toString("base64");
            parts = [prompt, {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType,
                },
            }];
        }

        if (parts.length === 1 && typeof parts[0] === 'string') {
            // Text only mode
            const result = await model.generateContent(parts[0]);
            return result.response.text();
        } else {
            // Multimodal mode
            const result = await model.generateContent(parts);
            return result.response.text();
        }

    } catch (error) {
        console.error("Error generating summary detailed:", JSON.stringify(error, null, 2));
        if (error.response) {
            console.error("Gemini API Error Response:", await error.response.text().catch(() => "N/A"));
        }
        if (error.message.includes("API key")) {
            return "Configuration Error: Google Gemini API Key is invalid or missing.";
        }
        return "Summary could not be generated. Please review the full document.";
    }
};

// Check for API Key on load
if (!process.env.GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY is not set in environment variables. AI summarization will fail.");
}
