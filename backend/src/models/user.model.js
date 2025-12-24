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
    required: true
  },
  adminPasskey: { type: String },
  role: {
    type: String, enum: ["admin", "doctor", "receptionist"],
    default: "receptionist"
  },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model("User", userSchema);
