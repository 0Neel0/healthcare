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
        const { name, email, phone, password } = req.body;

        // Validate required fields
        if (!email || !password || !name || !phone) {
            console.log('[Registration Error] Missing required fields:', {
                hasEmail: !!email,
                hasPassword: !!password,
                hasName: !!name,
                hasPhone: !!phone
            });
            return res.status(400).json({
                message: 'Name, email, phone, and password are required'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if patient already exists
        let existingPatient = await Patient.findOne({ email: normalizedEmail });
        if (existingPatient) {
            console.log(`[Registration] Patient already exists: ${normalizedEmail}`);
            // If user exists but has no password, update it
            if (password && !existingPatient.password) {
                const salt = await bcrypt.genSalt(10);
                existingPatient.password = await bcrypt.hash(password, salt);
                await existingPatient.save();
                console.log(`[Registration] Updated password for existing user: ${existingPatient.email}`);
            }
            return res.status(200).json(existingPatient);
        }

        // Create patient record with only essential fields
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const patientData = {
            name,
            email: normalizedEmail,
            phone,
            password: hashedPassword,
            // Add optional fields if provided
            ...(req.body.birthDate && { birthDate: req.body.birthDate }),
            ...(req.body.gender && { gender: req.body.gender }),
            ...(req.body.address && { address: req.body.address }),
            ...(req.body.occupation && { occupation: req.body.occupation })
        };

        console.log('[Registration] Creating new patient:', normalizedEmail);
        const patient = await Patient.create(patientData);
        console.log('[Registration] Patient created successfully:', patient._id);

        res.status(201).json(patient);
    } catch (err) {
        console.error('[Registration Error]', err);
        // Log detailed validation errors
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            console.error('[Validation Errors]', errors);
            return res.status(400).json({
                message: 'Validation failed',
                errors
            });
        }
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

        // Ensure the frontend receives a consistent ID field
        const patientResponse = patient.toObject();
        patientResponse.id = patient._id;

        res.json({ token, user: patientResponse });
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
        let updateData = { ...req.body };

        // Handle File Upload
        if (req.file) {
            updateData.profilePicture = req.file.path; // Cloudinary URL
        }

        const updated = await Patient.findByIdAndUpdate(
            req.params.id,
            { ...updateData, updatedAt: new Date() },
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