import { Patient } from "../models/patient.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

/**
 * Create a new patient (initial user creation)
 */
const createPatient = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Check if patient already exists
        // Check if patient already exists
        let existingPatient = await Patient.findOne({ email: req.body.email.trim().toLowerCase() });
        if (existingPatient) {
            // FIX: If user exists but has no password (or just re-registering), update the password!
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                existingPatient.password = await bcrypt.hash(req.body.password, salt);
                await existingPatient.save();
                console.log(`[Registration] Updated password for existing user: ${existingPatient.email}`);
            }
            return res.status(200).json(existingPatient);
        }

        // Create minimal patient record
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password || 'default123', salt);

        const patient = await Patient.create({
            name: req.body.name,
            email: req.body.email.trim().toLowerCase(), // Trim + Lowercase
            phone: req.body.phone,
            password: hashedPassword,
            // Set default values for required fields (will be updated in registration)
            birthDate: req.body.birthDate || new Date(),
            gender: req.body.gender || 'Other',
            address: req.body.address || 'TBD',
            emergencyContactName: req.body.emergencyContactName || 'TBD',
            emergencyContactNumber: req.body.emergencyContactNumber || 'TBD',
            primaryPhysician: req.body.primaryPhysician || 'TBD',
            insuranceProvider: req.body.insuranceProvider || 'TBD',
            insurancePolicyNumber: req.body.insurancePolicyNumber || 'TBD'
        });

        res.status(201).json(patient);
    } catch (err) {
        next(err);
    }
};

/**
 * Register patient with full information
 */
const registerPatient = async (req, res, next) => {
    try {
        const { id } = req.params;

        const patient = await Patient.findById(id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Update patient with complete registration data
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const updatedPatient = await Patient.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json(updatedPatient);
    } catch (err) {
        next(err);
    }
};

/**
 * Get all patients
 */
const getPatients = async (req, res, next) => {
    try {
        const patients = await Patient.find().sort({ createdAt: -1 });
        res.json(patients);
    } catch (err) {
        next(err);
    }
};

/**
 * Get single patient by ID
 */
const getPatient = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json(patient);
    } catch (err) {
        next(err);
    }
};

/**
 * Login patient
 */
const loginPatient = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email ? email.trim().toLowerCase() : '';
        console.log(`[Login Attempt] Email: '${normalizedEmail}'`);

        if (!normalizedEmail || !password) {
            return res.status(400).json({ message: 'Email and Password are required' });
        }

        const patient = await Patient.findOne({ email: normalizedEmail });

        if (!patient) {
            console.log('[Login Failed] User not found in DB');
            return res.status(400).json({ message: 'User not found. Please Register first.' });
        }

        // Handle legacy users or missing password
        if (!patient.password) {
            console.log('[Login Failed] No password set on user record');
            return res.status(400).json({ message: 'Account exists but has no password. Please Register again to set one.' });
        }

        const match = await bcrypt.compare(password, patient.password);
        if (!match) {
            console.log('[Login Failed] Password mismatch');
            return res.status(400).json({ message: 'Incorrect Password. Please try again.' });
        }

        console.log('[Login Success] User logged in');
        const secret = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production';
        const token = jwt.sign({ id: patient._id, role: 'patient' }, secret, { expiresIn: '7d' });
        res.json({ token, patient });
    } catch (err) {
        console.error('[Login Error]', err);
        next(err);
    }
};

/**
 * Get patient by email
 */
const getPatientByEmail = async (req, res, next) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const patient = await Patient.findOne({ email });

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json(patient);
    } catch (err) {
        next(err);
    }
};

/**
 * Update patient
 */
const updatePatient = async (req, res, next) => {
    try {
        const updated = await Patient.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json(updated);
    } catch (err) {
        next(err);
    }
};

/**
 * Delete patient
 */
const deletePatient = async (req, res, next) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json({ message: 'Patient removed' });
    } catch (err) {
        next(err);
    }
};

const patientController = {
    createPatient,
    loginPatient,
    registerPatient,
    getPatient,
    getPatientByEmail,
    getPatients,
    updatePatient,
    deletePatient
};

export default patientController;