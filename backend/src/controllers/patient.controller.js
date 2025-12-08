import { Patient } from "../models/patient.model.js";


const createPatient = async (req, res, next) => {
    try {
        const patient = await Patient.create(req.body);
        res.json(patient);
    }catch (err) {
        next(err);
    }
};


const getPatients = async (req, res, next) => {
    try {
        const patients = await Patient.find().sort({ createdAt: -1 });
        res.json(patients);
    }catch (err) {
        next(err);
    }
};


const getPatient = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.id);
        res.json(patient);
    } catch (err) {
        next(err);
    }
};


const updatePatient = async (req, res, next) => {
    try {
        const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    }catch (err) {
        next(err);
    }
};


const deletePatient = async (req, res, next) => {
    try{
        await Patient.findByIdAndDelete(req.params.id);
        res.json({ message: 'Patient removed' });
    }catch (err) {
        next(err);
    }
};

const patientController={
    createPatient,
    getPatient,
    getPatients,
    updatePatient,
    deletePatient
}
export default patientController;