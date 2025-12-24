/**
 * Admin authentication middleware
 * Validates the admin passkey from request headers
 */
export const verifyAdminPasskey = (req, res, next) => {
    const passkey = req.headers['x-admin-passkey'];
    const adminPasskey = process.env.ADMIN_PASSKEY || '123456'; // Default passkey

    if (!passkey) {
        return res.status(401).json({
            message: 'Admin passkey is required',
            error: 'PASSKEY_MISSING'
        });
    }

    if (passkey !== adminPasskey) {
        return res.status(401).json({
            message: 'Invalid admin passkey',
            error: 'PASSKEY_INVALID'
        });
    }

    next();
};

/**
 * Validate admin passkey without middleware (for direct validation)
 */
export const validatePasskey = (passkey) => {
    const adminPasskey = process.env.ADMIN_PASSKEY || '123456';
    return passkey === adminPasskey;
};
