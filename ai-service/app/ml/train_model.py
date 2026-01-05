import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import json
import os
import random

# 1. Define Knowledge Base (Disease -> Symptoms)
# We map diseases to their common symptoms.
disease_symptoms = {
    "Influenza (Flu)": ["fever", "cough", "fatigue", "headache", "muscle_pain", "sore_throat"],
    "Common Cold": ["cough", "sore_throat", "runny_nose", "sneezing", "congestion"],
    "COVID-19": ["fever", "cough", "fatigue", "loss_of_taste", "loss_of_smell", "difficulty_breathing"],
    "Malaria": ["fever", "chills", "sweating", "headache", "nausea", "muscle_pain"],
    "Typhoid": ["high_fever", "headache", "stomach_pain", "weakness", "vomiting", "loose_stools"],
    "Diabetes Type 2": ["increased_thirst", "frequent_urination", "hunger", "fatigue", "blurred_vision"],
    "Hypertension": ["headache", "shortness_of_breath", "nosebleeds", "dizziness", "chest_pain"],
    "Migraine": ["severe_headache", "nausea", "sensitivity_to_light", "sensitivity_to_sound", "throbbing_pain"],
    "Gastroenteritis": ["nausea", "vomiting", "diarrhea", "stomach_cramps", "low_grade_fever"],
    "Pneumonia": ["cough_with_phlegm", "fever", "chills", "difficulty_breathing", "chest_pain"]
}

# 2. Generate Synthetic Dataset
def generate_synthetic_data(num_samples=2000):
    data = []
    
    # Get all unique symptoms
    all_symptoms = sorted(list(set([s for symptoms in disease_symptoms.values() for s in symptoms])))
    
    print(f"Generating {num_samples} samples across {len(disease_symptoms)} diseases...")
    print(f"Total identifying symptoms: {len(all_symptoms)}")
    
    for _ in range(num_samples):
        # Pick a random disease
        disease = random.choice(list(disease_symptoms.keys()))
        true_symptoms = disease_symptoms[disease]
        
        # Create a sample vector
        sample = {}
        for symptom in all_symptoms:
            # Logic: If it's a symptom of the disease, high chance (90%) it's present.
            # Else, low chance (5%) it's present (noise).
            if symptom in true_symptoms:
                sample[symptom] = 1 if random.random() < 0.9 else 0
            else:
                sample[symptom] = 1 if random.random() < 0.05 else 0
                
        sample['Disease'] = disease
        data.append(sample)
        
    return pd.DataFrame(data), all_symptoms

# 3. Train Model
def train():
    df, all_symptoms = generate_synthetic_data()
    
    X = df[all_symptoms]
    y = df['Disease']
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Model
    print("Training Random Forest Classifier...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)
    
    # Evaluate
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print("-" * 30)
    print(f"Model Accuracy: {accuracy * 100:.2f}%")
    print("-" * 30)
    # print(classification_report(y_test, y_pred))
    
    # 4. Save Artifacts
    model_dir = os.path.join(os.path.dirname(__file__), '../models')
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, 'disease_model.pkl')
    symptoms_path = os.path.join(model_dir, 'symptoms.json')
    
    joblib.dump(clf, model_path)
    with open(symptoms_path, 'w') as f:
        json.dump(all_symptoms, f)
        
    print(f"Model saved to: {model_path}")
    print(f"Symptoms saved to: {symptoms_path}")

if __name__ == "__main__":
    train()
