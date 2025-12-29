import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token;
    if (!token) return res.status(401).json({ message: 'No token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token invalid' });
    }
};
export const verifyToken = auth;

export const isDoctorOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'doctor' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Doctor or Admin only.' });
    }
};

export default auth;