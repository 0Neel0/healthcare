import { Inventory } from "../models/inventory.model.js";
import { Prescription } from "../models/prescription.model.js";
import { Billing } from "../models/billing.model.js";

export const getInventory = async (req, res) => {
    try {
        const items = await Inventory.find().sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addItem = async (req, res) => {
    try {
        const newItem = new Inventory(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedItem = await Inventory.findByIdAndUpdate(id, { ...req.body, updatedAt: Date.now() }, { new: true });
        if (!updatedItem) return res.status(404).json({ message: "Item not found" });
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedItem = await Inventory.findByIdAndDelete(id);
        if (!deletedItem) return res.status(404).json({ message: "Item not found" });
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getLowStockItems = async (req, res) => {
    try {
        // Find items where stock is less than or equal to reorderLevel
        const lowStockItems = await Inventory.find({ $expr: { $lte: ["$stock", "$reorderLevel"] } });
        res.status(200).json(lowStockItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Pharmacy Specific ---

/**
 * Dispense medicines for a prescription.
 * Body: { prescriptionId, medicines: [{ inventoryId, quantity }] }
 */
export const dispenseMedicine = async (req, res) => {
    try {
        const { prescriptionId, items } = req.body; // items = [{ name, quantity }] or [{ inventoryId, quantity }]

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items to dispense" });
        }

        const dispensedItems = [];
        let totalCost = 0;

        // Process each item transactionally (conceptually)
        for (const item of items) {
            // Find item by ID or Name (prefer ID for exact match)
            let inventoryItem;
            if (item.inventoryId) {
                inventoryItem = await Inventory.findById(item.inventoryId);
            } else {
                // Fuzzy search by name for MVP
                inventoryItem = await Inventory.findOne({
                    name: { $regex: new RegExp(`^${item.name}$`, 'i') },
                    type: 'Medicine'
                });
            }

            if (!inventoryItem) {
                return res.status(404).json({ message: `Medicine not found: ${item.name || item.inventoryId}` });
            }

            const qty = parseInt(item.quantity) || 1;

            if (inventoryItem.stock < qty) {
                return res.status(400).json({
                    message: `Insufficient stock for ${inventoryItem.name}. Available: ${inventoryItem.stock}, Requested: ${qty}`
                });
            }

            // Decrement Stock
            inventoryItem.stock -= qty;
            await inventoryItem.save();

            // Calculate Cost
            const cost = (inventoryItem.sellingPrice || 0) * qty;
            totalCost += cost;

            dispensedItems.push({
                name: inventoryItem.name,
                quantity: qty,
                cost: cost,
                inventoryId: inventoryItem._id
            });
        }

        // Update Prescription Status
        let prescription = null;
        let patientId = null;

        if (prescriptionId) {
            prescription = await Prescription.findByIdAndUpdate(
                prescriptionId,
                { pharmacyStatus: 'dispensed' },
                { new: true }
            );
            patientId = prescription?.patientId;
        }

        // Create Billing Entry automatically
        if (patientId) {
            const newBill = new Billing({
                patientId: patientId,
                totalAmount: totalCost,
                paymentStatus: 'Pending',
                services: dispensedItems.map(d => ({
                    name: `Pharmacy: ${d.name}`,
                    quantity: d.quantity,
                    cost: d.cost
                })),
                notes: `Generated from Prescription #${prescriptionId}`
            });
            await newBill.save();
        }

        res.json({
            message: "Medicines dispensed successfully",
            items: dispensedItems,
            totalCost
        });

    } catch (error) {
        console.error("Dispense Error:", error);
        res.status(500).json({ message: error.message });
    }
};
