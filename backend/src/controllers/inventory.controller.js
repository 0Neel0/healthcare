import { Inventory } from "../models/inventory.model.js";

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
