import google.generativeai as genai
import os
import json
import math

class MedRagService:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.embedding_model = "models/text-embedding-004"
        self.gen_model = genai.GenerativeModel('gemini-2.5-flash')
        
        # In-Memory Knowledge Base
        self.documents = []  # List of {'id', 'text', 'embedding'}
        self.load_knowledge_base()

    def load_knowledge_base(self):
        """Loads and embeds the simulated dataset into memory."""
        try:
            file_path = os.path.join(os.path.dirname(__file__), '../data/medquad_sample.json')
            if not os.path.exists(file_path):
                print(f"Warning: Data file not found at {file_path}")
                return

            with open(file_path, 'r') as f:
                data = json.load(f)

            print(f"Loading {len(data)} medical records into memory...")
            
            # Prepare batch for embedding to save API calls
            texts_to_embed = [f"Question: {item['question']}\nAnswer: {item['answer']}" for item in data]
            
            # Generate Embeddings (Batch)
            # Note: Gemini batch embedding might have limits, for small sample it's fine.
            # If large, we would chunk this loop.
            try:
                result = genai.embed_content(
                    model=self.embedding_model,
                    content=texts_to_embed,
                    task_type="retrieval_document"
                )
                embeddings = result['embedding']
            except Exception as e:
                print(f"Batch embedding failed, trying individual: {e}")
                embeddings = []
                for text in texts_to_embed:
                    res = genai.embed_content(model=self.embedding_model, content=text, task_type="retrieval_document")
                    embeddings.append(res['embedding'])

            # Store in memory
            for i, item in enumerate(data):
                self.documents.append({
                    'id': item['id'],
                    'text': texts_to_embed[i],
                    'embedding': embeddings[i]
                })
            
            print("Med-Secure AI Knowledge Base Ready.")

        except Exception as e:
            print(f"Error loading knowledge base: {e}")

    def cosine_similarity(self, v1, v2):
        """Pure Python Cosine Similarity (No Numpy needed)"""
        dot_product = sum(a*b for a, b in zip(v1, v2))
        magnitude_v1 = math.sqrt(sum(a*a for a in v1))
        magnitude_v2 = math.sqrt(sum(a*a for a in v2))
        if magnitude_v1 == 0 or magnitude_v2 == 0:
            return 0.0
        return dot_product / (magnitude_v1 * magnitude_v2)

    def retrieve_context(self, question: str, top_k: int = 3) -> str:
        try:
            # 1. Embed Query
            q_res = genai.embed_content(
                model=self.embedding_model,
                content=question,
                task_type="retrieval_query"
            )
            q_emb = q_res['embedding']

            # 2. Score Documents
            scored_docs = []
            for doc in self.documents:
                score = self.cosine_similarity(q_emb, doc['embedding'])
                scored_docs.append((score, doc['text']))

            # 3. Sort and Top-K
            scored_docs.sort(key=lambda x: x[0], reverse=True)
            top_results = scored_docs[:top_k]

            # 4. Format Context
            context = ""
            for i, (score, text) in enumerate(top_results):
                context += f"Source {i+1} (Relevance: {score:.2f}):\n{text}\n\n"
            
            return context

        except Exception as e:
            print(f"MedRAG Retrieval Error: {e}")
            return ""

    def chat(self, question: str) -> str:
        try:
            # 1. Retrieve
            context = self.retrieve_context(question)
            
            # 2. Guardrails & System Prompt
            system_instruction = (
                "You are 'Med-Secure AI', a specialized medical assistant trained on MedQuAD data. "
                "Your goal is to provide helpful, accurate medical information based ONLY on the provided context.\n\n"
                "SAFETY GUARDRAILS (STRICTLY ENFORCED):\n"
                "1. DO NOT provide specific medical prescriptions or dosages unless explicitly stated in the context.\n"
                "2. DO NOT make definitive diagnoses. Always frame answers as 'common symptoms include...' or 'this may suggest...'.\n"
                "3. ALWAYS advise the user to consult a qualified doctor for serious concerns.\n"
                "4. If the user asks about a topic NOT in the context, politely decline to answer, stating it is out of your training scope.\n\n"
                "DISCLAIMER: This is AI-generated information and not a substitute for professional medical advice."
            )

            prompt = (
                f"{system_instruction}\n\n"
                f"Retrieved Context:\n{context}\n\n"
                f"User Question: {question}"
            )

            # 3. Generate
            response = self.gen_model.generate_content(prompt)
            return response.text

        except Exception as e:
            print(f"MedChat Error: {e}")
            return "I encountered an error processing your query. Please try again."
