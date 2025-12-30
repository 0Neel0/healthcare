import google.generativeai as genai
import numpy as np
from typing import List, Dict

class RAGService:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.embedding_model = 'models/text-embedding-004' 
        self.gen_model = genai.GenerativeModel('gemini-2.5-flash-lite')

    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        chunks = []
        start = 0
        text_len = len(text)
        while start < text_len:
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start += chunk_size - overlap 
        return chunks

    def get_embeddings(self, chunks: List[str]) -> List[List[float]]:
        try:
            all_embeddings = []
            batch_size = 100
            for i in range(0, len(chunks), batch_size):
                batch = chunks[i : i + batch_size]
                if not batch: continue
                print(f"Embedding batch {i//batch_size + 1}...")
                result = genai.embed_content(
                    model=self.embedding_model,
                    content=batch,
                    task_type="retrieval_document",
                    title="Medical Document Chunk"
                )
                if 'embedding' in result:
                     all_embeddings.extend(result['embedding'])
            return all_embeddings
        except Exception as e:
            print(f"Embedding generation failed: {e}")
            raise e

    def retrieve_relevant_chunks(self, question: str, chunks: List[str], chunk_embeddings: List[List[float]], top_k: int = 3) -> str:
        # 1. Embed Question
        q_result = genai.embed_content(
            model=self.embedding_model,
            content=question,
            task_type="retrieval_query"
        )
        q_embedding = np.array(q_result['embedding'])

        # 2. Similarity
        chunk_embeddings_np = np.array(chunk_embeddings)
        dot_products = np.dot(chunk_embeddings_np, q_embedding)
        norms = np.linalg.norm(chunk_embeddings_np, axis=1) * np.linalg.norm(q_embedding)
        similarities = dot_products / norms

        # 3. Top K
        k = min(top_k, len(chunks))
        top_indices = np.argsort(similarities)[-k:][::-1]

        # 4. Context
        relevant_context = ""
        print(f"--- RAG Retrieval ---")
        for idx in top_indices:
            relevant_context += f"Info {idx+1}:\n{chunks[idx]}\n\n"
        return relevant_context

    def answer_question_rag(self, full_text: str, question: str) -> str:
        try:
            chunks = self.chunk_text(full_text)
            if not chunks: return "Empty document."
            
            print(f"Generating embeddings for {len(chunks)} chunks...")
            chunk_embeddings = self.get_embeddings(chunks)
            context = self.retrieve_relevant_chunks(question, chunks, chunk_embeddings)

            prompt = (
                "Answer the user's question using ONLY the provided context.\n"
                f"Context:\n{context}\n\n"
                f"Question: {question}"
            )

            response = self.gen_model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"RAG Pipeline Error: {e}")
            raise e
