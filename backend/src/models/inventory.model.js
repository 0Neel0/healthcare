import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Medicine', 'Consumable', 'Equipment', 'Other'], required: true },
    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true }, // e.g., 'tablets', 'bottles', 'pieces'

    // Pharmacy Specific Fields
    batchNumber: { type: String },
    expiryDate: { type: Date },
    manufacturer: { type: String },
    dosageForm: { type: String }, // e.g., Tablet, Syrup, Injection
    strength: { type: String }, // e.g., 500mg, 10ml
    sellingPrice: { type: Number }, // Price per unit
    costPerUnit: { type: Number }, // Purchase price

    supplier: { type: String },
    reorderLevel: { type: Number, default: 10 },
    location: { type: String }, // e.g., 'Shelf A1'

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const Inventory = mongoose.model('Inventory', InventorySchema);
