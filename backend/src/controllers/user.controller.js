import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import { OAuth2Client } from 'google-auth-library';
import dotenv from "dotenv";
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res, next) => {
    try {
        const { credential } = req.body;

        // 1. Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { email, name, picture, sub: googleId } = ticket.getPayload();

        // 2. Check if user exists
        let user = await User.findOne({ $or: [{ email }, { googleId }] });

        if (!user) {
            // 3. Register New User
            const randomPassword = Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = await User.create({
                name,
                email,
                password: hashedPassword, // Dummy password
                role: 'patient', // Default role for OAuth
                googleId,
                avatar: picture
            });
        } else if (!user.googleId) {
            // Link existing account
            user.googleId = googleId;
            user.avatar = picture;
            await user.save();
        }

        // 4. Generate Token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        console.log('Google Login Success:', { email, name, role: user.role }); // Debug log

        res.json({ token, user });

    } catch (err) {
        console.error('Google Login Error:', err);
        res.status(401).json({ message: 'Google authentication failed' });
    }
};

const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        const newUser = await User.create({ name, email, password: hashed, role });
        const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: newUser });
    } catch (err) {
        console.error('Registration error:', err.message);
        console.error('Stack trace:', err.stack);
        res.status(500).json({ message: err.message || 'Registration failed' });
    }
};


const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user })
    } catch (err) {
        next(err);
    }
};

const logout = async (req, res, next) => {
    try {
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        next(err);
    }
};

/**
 * Get all doctors (users with role='doctor')
 */
const getDoctors = async (req, res, next) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('-password');
        res.json(doctors);
    } catch (err) {
        next(err);
    }
};

/**
 * Update user by ID
 */
const updateUser = async (req, res, next) => {
    try {
        const { name, email, phone, password } = req.body;
        const updateData = { name, email, phone };

        // Only update password if provided
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updatedUser);
    } catch (err) {
        next(err);
    }
};

/**
 * Delete user by ID
 */
const deleteUser = async (req, res, next) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        next(err);
    }
};

const userController = {
    register,
    login,
    googleLogin,
    logout,
    getDoctors,
    updateUser,
    deleteUser
}

export default userController;