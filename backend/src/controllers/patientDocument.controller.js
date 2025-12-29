import { PatientDocument } from "../models/patientDocument.model.js";

// Upload a new document
export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { title, description } = req.body;
        const patientId = req.user.id; // User is authenticated as patient

        const newDoc = new PatientDocument({
            patientId,
            title: title || req.file.originalname,
            description,
            fileUrl: `/uploads/${req.file.filename}`,
            fileType: req.file.mimetype,
            uploadedBy: req.user.id
        });

        await newDoc.save();
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
