import express from "express";
import multer from "multer";
import FormData from "form-data";
import fetch from "node-fetch";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/analyze", upload.single("image"), async (req, res) => {
    console.log("Received /analyze request");
    try {
        if (!req.file) {
            console.error("No file in request");
            return res.status(400).json({ message: "No image file provided" });
        }
        console.log(`File received: ${req.file.originalname}, Size: ${req.file.size} bytes`);

        // Prepare format for AI service using form-data package
        const formData = new FormData();
        formData.append("file", req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
        console.log(`Forwarding to AI Service at: ${aiServiceUrl}/analyze-image`);

        const aiResponse = await fetch(`${aiServiceUrl}/analyze-image`, {
            method: "POST",
            body: formData,
            headers: formData.getHeaders(),
        });

        console.log(`AI Service Response Status: ${aiResponse.status}`);

        if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            console.error(`AI Service Failed: ${errorText}`);
            throw new Error(`AI Service Error: ${errorText}`);
        }

        const data = await aiResponse.json();
        console.log("AI Analysis Successful");
        res.json(data);

    } catch (error) {
        console.error("Medical Imaging Error Stack:", error);
        res.status(500).json({ message: error.message || "Failed to analyze image", details: error.toString() });
    }
});

export default router;
