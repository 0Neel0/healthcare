from abc import ABC, abstractmethod
import google.generativeai as genai
import os

class Summarizer(ABC):
    @abstractmethod
    def summarize(self, text: str) -> str:
        pass

import google.generativeai as genai

class GeminiSummarizer(Summarizer):
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash-lite')
        print(f"Initialized Gemini Summarizer with model: gemini-2.5-flash-lite")

    def summarize(self, text: str) -> str:
        try:
            clean_text = text[:30000] # Safe truncation

            prompt = (
                "Analyze this medical report and provide a concise summary for the patient. "
                "Include key findings, any abnormal results, and doctor's recommendations if present. "
                "Keep it simple and easy to understand. "
                "DISCLAIMER: This is not a medical diagnosis.\n\n"
                f"Content:\n{clean_text}"
            )
            
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Summarization failed: {e}")
            raise e

    def answer_question(self, context: str, question: str) -> str:
        try:
            prompt = (
                "You are a helpful medical AI assistant. "
                "Answer the user's question based ONLY on the provided medical document context below. "
                "If the answer is not in the document, strictly state that you cannot find the information.\n\n"
                f"Context:\n{context[:30000]}\n\n"
                f"Question: {question}"
            )
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Q&A failed: {e}")
            raise e
