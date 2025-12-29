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
  phone: { type: String },
  password: {
    type: String,
    required: false
  },
  adminPasskey: { type: String },
  role: {
    type: String, enum: ["admin", "doctor", "receptionist", "patient"],
    default: "patient"
  },
  googleId: { type: String, unique: true, sparse: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model("User", userSchema);
