import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Medicine', 'Consumable', 'Equipment', 'Other'], required: true },
    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true }, // e.g., 'tablets', 'bottles', 'pieces'
    expiryDate: { type: Date },
    supplier: { type: String },
    reorderLevel: { type: Number, default: 10 },
    costPerUnit: { type: Number },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const Inventory = mongoose.model('Inventory', InventorySchema);
