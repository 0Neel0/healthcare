import axios from 'axios';

/**
 * AIJobService
 * Handles communication with the Python AI Microservice.
 */
class AIJobService {
    constructor() {
        // In a real scenario, this would be an enviroment variable
        // Assuming Python service runs on port 8000
        this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    }

    /**
     * dispatchJob
     * Sends a processing job to the AI service.
     * @param {string} documentId - The ID of the document record
     * @param {string} filePath - Absolute path to the file
     * @param {string} mimeType - File MIME type
     */
    async dispatchJob(documentId, filePath, mimeType) {
        try {
            console.log(`[AIJobService] Dispatching job for doc ${documentId} to ${this.aiServiceUrl}/process`);

            // Fire and forget (Async) - or wait for acknowledgement
            // We don't await the *result*, just the *dispatch*
            await axios.post(`${this.aiServiceUrl}/process`, {
                document_id: documentId,
                file_path: filePath,
                mime_type: mimeType
            });

            return true;
        } catch (error) {
            console.error(`[AIJobService] Failed to dispatch job:`, error.message);
            // In a production system, we would add this to a retry queue (e.g., BullMQ / RabbitMQ)
            return false;
        }
    }

    /**
     * askQuestion
     * Sends a question and context to the AI service.
     * @param {string} context - The full text of the document
     * @param {string} question - The user's question
     */
    async askQuestion(context, question) {
        try {
            console.log(`[AIJobService] Asking question to ${this.aiServiceUrl}/qa`);
            const response = await axios.post(`${this.aiServiceUrl}/qa`, {
                context,
                question
            });
            return response.data;
        } catch (error) {
            console.error(`[AIJobService] Question failed:`, error.message);
            throw error;
        }
    }

    /**
     * predictDiseaseML
     * Calls the Custom ML Endpoint
     */
    async predictDiseaseML(symptoms) {
        try {
            console.log(`[AIJobService] Prediciting disease for symptoms: ${symptoms}`);
            const response = await axios.post(`${this.aiServiceUrl}/predictions/disease-custom`, {
                symptoms
            });
            return response.data;
        } catch (error) {
            console.error(`[AIJobService] Prediction failed:`, error.message);
            return { error: error.message }; // Return error object gracefully
        }
    }

    /**
     * analyzeImage
     * Forwards a file to the Python AI service
     */
    async analyzeImage(formData) {
        try {
            console.log(`[AIJobService] Sending image to ${this.aiServiceUrl}/analyze-image`);
            // Note: Content-Type header is handled automatically by Axios/FormData usually, 
            // but we need to ensure headers from incoming request are passed or reconstructed
            const response = await axios.post(`${this.aiServiceUrl}/analyze-image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`[AIJobService] Image analysis failed:`, error.message);
            throw error;
        }
    }
}

export const aiJobService = new AIJobService();
