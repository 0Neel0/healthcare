import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config();
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
    }catch (err) {
        next(err);
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
    }catch (err) {
        next(err);
    }
};



const userController={
    register,
    login,
    logout
}
export default userController;