import jwt from 'jsonwebtoken';
import { userModel } from '../models/Users.js';

const isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        res.status(401).json({
            success: false,
            message: "Please Login First",
        });
    }

    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await userModel.findById(decodedData._id);
        next();
    } catch (error) {
        // Handle invalid tokens or token expiration here
        res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

const authorizedRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `${req.user.role} is not allowed to access this role`
            });
        }
        next();
    }
}

export { isAuthenticated, authorizedRole };
