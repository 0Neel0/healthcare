import { PatientDocument } from "../models/patientDocument.model.js";
import { storageService } from "../services/StorageService.js";
import { aiJobService } from "../services/AIJobService.js";

// Upload a new document
export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { title, description } = req.body;
        const patientId = req.user.id;

        // 1. Secured Storage (Assumed handled by Multer for now, but path validation is via StorageService)
        const filePath = storageService.getFilePath(req.file.filename);
        if (!storageService.validateFileExists(req.file.filename)) {
            return res.status(500).json({ message: "File storage validation failed" });
        }

        // 2. Persist Metadata with PENDING status
        const newDoc = new PatientDocument({
            patientId,
            title: title || req.file.originalname,
            description,
            fileUrl: `/uploads/${req.file.filename}`,
            fileType: req.file.mimetype,
            uploadedBy: req.user.id,
            status: 'PENDING'
        });

        await newDoc.save();

        // 3. Async Dispatch to AI Microservice
        // We do NOT await the result here. Typically this would go to a queue.
        aiJobService.dispatchJob(newDoc._id, filePath, req.file.mimetype);

        res.status(201).json(newDoc);

    } catch (error) {
        console.error("Error uploading document:", error);
        res.status(500).json({ message: "Server error during upload" });
    }
};

// Get documents for the current logged-in patient
export const getMyDocuments = async (req, res) => {
    try {
        const docs = await PatientDocument.find({ patientId: req.user.id }).sort({ uploadDate: -1 });
        res.json(docs);
    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ message: "Server error fetching documents" });
    }
};

// Get documents for a specific patient (Doctor/Admin access)
export const getDocumentsByPatientId = async (req, res) => {
    try {
        const { patientId } = req.params;
        const docs = await PatientDocument.find({ patientId }).sort({ uploadDate: -1 });
        res.json(docs);
    } catch (error) {
        console.error("Error fetching patient documents:", error);
        res.status(500).json({ message: "Server error fetching patient documents" });
    }
};

// Delete a document
export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await PatientDocument.findById(id);

        if (!doc) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Verify ownership (or admin/doctor rights?)
        // Assuming patients can only delete their own.
        // Doctors/Admins might check 'role'.
        if (doc.patientId.toString() !== req.user.id && req.user.role === 'patient') {
            return res.status(403).json({ message: "Not authorized to delete this document" });
        }

        await PatientDocument.findByIdAndDelete(id);
        res.json({ message: "Document deleted successfully" });

    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json({ message: "Server error deleting document" });
    }
};
// Update Document Status (Callback for AI Service)
export const updateDocumentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, summary, error, extractedText } = req.body;

        const updateData = { status };
        if (summary) updateData.summary = summary;
        if (error) updateData.processingError = error;
        if (extractedText) updateData.extractedText = extractedText;

        const doc = await PatientDocument.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!doc) {
            return res.status(404).json({ message: "Document not found" });
        }

        console.log(`[Callback] Updated document ${id} status to ${status}`);
        res.json(doc);
    } catch (err) {
        console.error("Error updating document status:", err);
        res.status(500).json({ message: "Server error updating status" });
    }
};

// Ask a question about a document
export const askQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { question } = req.body;

        const doc = await PatientDocument.findById(id);
        if (!doc) {
            return res.status(404).json({ message: "Document not found" });
        }

        if (!doc.extractedText) {
            return res.status(400).json({ message: "Document text not available for Q&A. Please wait for analysis to complete." });
        }

        const answer = await aiJobService.askQuestion(doc.extractedText, question);

        // Persist Chat History
        if (!doc.chatHistory) {
            doc.chatHistory = [];
        }
        doc.chatHistory.push({ role: 'user', content: question });
        doc.chatHistory.push({ role: 'assistant', content: answer.answer }); // AI Service returns { answer: "..." }
        await doc.save();

        res.json({ answer: answer.answer, chatHistory: doc.chatHistory });

    } catch (error) {
        console.error("Error asking question:", error);
        // Extract meaningful error message
        const errorMessage = error.response?.data?.detail || error.message || "Failed to get answer from AI";
        res.status(500).json({ message: errorMessage });
    }
};
