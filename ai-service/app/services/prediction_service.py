import os
import joblib
import json
import numpy as np
from dotenv import load_dotenv

# Load env variables (for consistency, though ML model is local)
load_dotenv(os.path.join(os.path.dirname(__file__), '../../../backend/.env'))

class PredictionService:
    def __init__(self, api_key=None):
        # We accept api_key to match the signature in main.py, even if we don't use it for the ML part
        self.model_path = os.path.join(os.path.dirname(__file__), '../models/disease_model.pkl')
        self.symptoms_path = os.path.join(os.path.dirname(__file__), '../models/symptoms.json')
        
        self.model = None
        self.all_symptoms = []
        
        self._load_model()

    def _load_model(self):
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.symptoms_path):
                self.model = joblib.load(self.model_path)
                with open(self.symptoms_path, 'r') as f:
                    self.all_symptoms = json.load(f)
                print(f"Loaded Disease Model from {self.model_path}")
            else:
                print("Disease Model not found. Please run train_model.py")
        except Exception as e:
            print(f"Failed to load model: {e}")

    def predict_inflow(self, days=7):
        # Placeholder for existing inflow logic if needed, or remove if unused
        return []

    def predict_no_show(self, age, gender, appointment_type):
        # Placeholder for existing risk logic
        return 10

    def predict_disease_ml(self, user_symptoms_str):
        """
        Predict disease based on comma-separated symptoms string.
        """
        if not self.model or not self.all_symptoms:
            raise Exception("Model not loaded")

        # 1. Parse Input
        # "fever, cough" -> ["fever", "cough"]
        input_symptoms = [s.strip().lower().replace(' ', '_') for s in user_symptoms_str.split(',')]
        
        # 2. Create Feature Vector
        feature_vector = []
        for symptom in self.all_symptoms:
            if symptom in input_symptoms:
                feature_vector.append(1)
            else:
                feature_vector.append(0)
        
        # Reshape for sklearn
        X = np.array([feature_vector])
        
        # 3. Predict
        valid_classes = self.model.classes_
        
        # Get probabilities
        probs = self.model.predict_proba(X)[0]
        
        # Get best match
        best_idx = np.argmax(probs)
        predicted_disease = valid_classes[best_idx]
        confidence = float(probs[best_idx])
        
        return {
            "disease": predicted_disease,
            "confidence_score": confidence,
            "symptoms_analyzed": input_symptoms
        }

