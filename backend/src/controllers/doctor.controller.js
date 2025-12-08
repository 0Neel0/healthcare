import { Doctor } from "../models/doctor.model.js";


const createDoctor = async (req, res, next) => {
    try {
        const doctor = await Doctor.create(req.body);
        res.json(doctor);
    } catch (err) {
        next(err);
    }
};


const getDoctors = async (req, res, next) => {
    try {
        const doctors = await Doctor.find();
        res.json(doctors);
    }catch(err) {
        next(err);
    }
};


const getDoctor = async (req, res, next) => {
    try{
        const doctor = await Doctor.findById(req.params.id);
        res.json(doctor);
    } catch (err) {
        next(err);
    }
};


const updateDoctor = async (req, res, next) => {
    try {
        const updated = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    }catch(err) {
        next(err);
    }
};


const deleteDoctor = async (req, res, next) => {
    try {
        await Doctor.findByIdAndDelete(req.params.id);
        res.json({ message: 'Doctor removed' });
    }catch(err){
        next(err);
    }
};

const doctorController={
    createDoctor,
    getDoctor,
    getDoctors,
    updateDoctor,
    deleteDoctor
}

export default doctorController;