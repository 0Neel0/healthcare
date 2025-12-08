import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name: {
     type: String, 
     required: true 
    },
  email: { 
    type: String, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, enum: ["admin", "doctor", "receptionist"], 
    default: "receptionist" },    
    createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model("User", userSchema);
