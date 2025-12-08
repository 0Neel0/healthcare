import { Appointment } from "../models/appointment.model.js";


const createAppointment = async (req, res, next) => {
    try {
        const appt = await Appointment.create(req.body);
        res.json(appt);
    }catch(err){
        next(err);
    }
};


const getAppointments = async (req, res, next) => {
    try {
        const appts = await Appointment.find()
        .populate('patient')
        .populate('doctor')
        .sort({ date: 1 });
        res.json(appts);
    }catch(err) {
        next(err);
    }
};


const getAppointment = async (req, res, next) => {
    try {
        const appt = await Appointment.findById(req.params.id).
        populate('patient').
        populate('doctor');
        res.json(appt);
    }catch(err) {
        ext(err);
    }
};


const updateAppointment = async (req, res, next) => {
    try {
        const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    }catch(err){
        next(err);
    }
};


const deleteAppointment = async (req, res, next) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Appointment removed' });
    }catch(err){
        next(err);
    }
};

const appointmentController={
    createAppointment,
    getAppointment,
    getAppointments,
    updateAppointment,
    deleteAppointment
}

export default appointmentController;

