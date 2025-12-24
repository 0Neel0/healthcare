import { Staff } from "../models/staff.model.js";

export const addStaff = async (req, res) => {
    try {
        const newStaff = new Staff(req.body);
        await newStaff.save();
        res.status(201).json(newStaff);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllStaff = async (req, res) => {
    try {
        const { role, department } = req.query;
        let query = { isActive: true };
        if (role) query.role = role;
        if (department) query.department = department;

        const staffMembers = await Staff.find(query).sort({ lastName: 1 });
        res.status(200).json(staffMembers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getStaffById = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await Staff.findById(id);
        if (!staff) return res.status(404).json({ message: "Staff member not found" });
        res.status(200).json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedStaff = await Staff.findByIdAndUpdate(id, { ...req.body, updatedAt: Date.now() }, { new: true });
        if (!updatedStaff) return res.status(404).json({ message: "Staff member not found" });
        res.status(200).json(updatedStaff);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteStaff = async (req, res) => {
    try {
        // Soft delete
        const { id } = req.params;
        const updatedStaff = await Staff.findByIdAndUpdate(id, { isActive: false, updatedAt: Date.now() }, { new: true });
        if (!updatedStaff) return res.status(404).json({ message: "Staff member not found" });
        res.status(200).json({ message: "Staff member deactivated successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
