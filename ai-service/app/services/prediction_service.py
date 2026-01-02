import os
import random
from datetime import datetime, timedelta
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv

# Load env variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../../../backend/.env'))
# Fallback to local if env fails
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/hms_db")

class PredictionService:
    def __init__(self):
        try:
            self.client = MongoClient(MONGO_URI)
            self.db = self.client.get_database()
            self.appointments = self.db.appointments
            print(f"Connected to MongoDB at {MONGO_URI}")
        except Exception as e:
            print(f"Failed to connect to MongoDB: {e}")
            self.appointments = None

    def predict_inflow(self, days=7):
        """
        Predict patient inflow using logic on REAL data + Moving Average.
        """
        if not self.appointments:
            return self._mock_inflow(days)

        predictions = []
        today = datetime.now()
        
        # 1. Fetch historical data (Last 30 days)
        start_date = today - timedelta(days=30)
        pipeline = [
            {
                "$match": {
                    "schedule": {"$gte": start_date},
                    "status": {"$ne": "cancelled"}
                }
            },
            {
                "$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$schedule"}},
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        
        results = list(self.appointments.aggregate(pipeline))
        
        # Convert to Pandas for easier math
        if not results:
            print("No historical data found, using Fallback Mock.")
            return self._mock_inflow(days)
            
        df = pd.DataFrame(results)
        df['date'] = pd.to_datetime(df['_id'])
        df = df.set_index('date')
        
        # Calculate Simple Moving Average (7-day window) as a base forecast
        avg_daily = df['count'].mean() if not df.empty else 10
        
        # Generate Forecast
        for i in range(days):
            date = today + timedelta(days=i)
            day_name = date.strftime("%a")
            is_weekend = date.weekday() >= 5
            
            # Base prediction is the moving average
            predicted = avg_daily
            
            # Adjust for weekend seasonality
            if is_weekend:
                predicted *= 0.4 # Expect 60% drop
            else:
                predicted *= 1.1 # Expect slight boost
            
            predictions.append({
                "date": date.strftime("%Y-%m-%d"),
                "day": day_name,
                "predicted_count": int(predicted)
            })
            
        return predictions

    def predict_no_show(self, age, gender, appointment_type, patient_id=None):
        """
        Calculate probability of no-show based on PERSONAL history + Risk factors.
        """
        base_score = 10 # Base risk
        
        # 1. Personal History Factor (The "Dynamic" part)
        personal_factor = 0
        if patient_id and self.appointments:
            try:
                 # Find stats for this patient
                 from bson.objectid import ObjectId
                 
                 # Check valid ID
                 if ObjectId.is_valid(patient_id):
                     total_apps = self.appointments.count_documents({"patient": ObjectId(patient_id)})
                     cancelled_apps = self.appointments.count_documents({"patient": ObjectId(patient_id), "status": "cancelled"})
                     
                     if total_apps > 0:
                         cancellation_rate = cancelled_apps / total_apps
                         # Huge penalty if they cancel often
                         if cancellation_rate > 0.5:
                             personal_factor = 50
                         elif cancellation_rate > 0.2:
                             personal_factor = 25
            except Exception as e:
                print(f"Error fetching personal history: {e}")

        # 2. Demographic Factors
        age_factor = 0
        if age > 70: age_factor = 20
        elif age < 10: age_factor = 15
        
        # 3. Type Factors
        type_factor = 0
        if appointment_type == "Follow-up": type_factor = 15
        elif appointment_type == "Checkup": type_factor = 5
        
        total_risk = base_score + personal_factor + age_factor + type_factor
        
        # Cap at 95%
        return min(max(total_risk, 0), 95)

    def _mock_inflow(self, days):
        """Fallback if DB fails"""
        predictions = []
        today = datetime.now()
        for i in range(days):
            date = today + timedelta(days=i)
            is_weekend = date.weekday() >= 5
            base = 20 if is_weekend else 60
            predictions.append({
                "date": date.strftime("%Y-%m-%d"),
                "day": date.strftime("%a"),
                "predicted_count": base + random.randint(-10, 15)
            })
        return predictions
