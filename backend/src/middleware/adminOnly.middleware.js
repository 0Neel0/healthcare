const adminOnly= async(req, res, next)=>{
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        next();
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
};
export default adminOnly;