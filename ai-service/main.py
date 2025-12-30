from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import uvicorn
import os
from dotenv import load_dotenv
from app.services.text_extractor import PDFTextExtractor
from app.services.summarizer import GeminiSummarizer
from app.services.rag_service import RAGService
import requests

# Load env from backend directory
env_path = os.path.join(os.path.dirname(__file__), '../backend/.env')
print(f"Loading env from: {os.path.abspath(env_path)}")
load_dotenv(env_path)

# Configuration
API_KEY = os.getenv("GEMINI_API_KEY")
print(f"API Key Found: {'Yes' if API_KEY else 'No'}")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:4000/api") # Node.js Backend

app = FastAPI()

# Dependencies
extractor = PDFTextExtractor()
summarizer = GeminiSummarizer(api_key=API_KEY) if API_KEY else None
rag_service = RAGService(api_key=API_KEY) if API_KEY else None

class JobRequest(BaseModel):
    document_id: str
    file_path: str
    mime_type: str

class QARequest(BaseModel):
    context: str
    question: str

def process_document(job: JobRequest):
    """
    Background task to process the document
    """
    print(f"Processing job for doc: {job.document_id}")
    try:
        # 1. Extract Text
        text = extractor.extract_text(job.file_path, job.mime_type)
        if not text:
            raise Exception("Failed to extract text from document")

        # 2. Summarize
        if not summarizer:
             raise Exception("Summarizer not configured (Missing API Key)")
        
        summary = summarizer.summarize(text)

        # 3. Callback to Backend (Update DB)
        # Note: In a real system, we'd use a shared secret or internal network
        payload = {
            "summary": summary,
            "status": "COMPLETED",
            "extractedText": text[:100000] # Increased limit for RAG (Approx 100k chars)
        }
        
        print(f"SUCCESS: Generated summary for {job.document_id}")
        response = requests.patch(f"{BACKEND_URL}/patient-documents/{job.document_id}/status", json=payload)
        print(f"Callback Status: {response.status_code}")

    except Exception as e:
        print(f"FAILED: {e}")
        try:
             requests.patch(f"{BACKEND_URL}/patient-documents/{job.document_id}/status", json={"status": "FAILED", "error": str(e)})
        except:
             pass

@app.post("/process")
async def create_job(job: JobRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(process_document, job)
    return {"message": "Job accepted", "document_id": job.document_id}

@app.post("/qa")
async def answer_question(req: QARequest):
    if not rag_service:
        raise HTTPException(status_code=500, detail="AI Service (RAG) not configured")
    try:
        # Use RAG Pipeline
        answer = rag_service.answer_question_rag(req.context, req.question)
        return {"answer": answer}
    except Exception as e:
        print(f"QA Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok", "python_version": "3.x"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
